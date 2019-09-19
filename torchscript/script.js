make_chart({
	name: 'resnet50',
	rollup: (column_name, d) => d3.mean(d, x => x[column_name]),

	xlabel: 'Commit Time',
	ylabel: 'Milliseconds',
	title: 'Resnet50 (mean of 10 runs)'
});
make_chart({
	name: 'resnet50',
	rollup: (column_name, d) => d3.variance(d, x => x[column_name]),
	xlabel: 'Commit Time',
	ylabel: 'Milliseconds',
	title: 'Resnet50 (variance of 10 runs)'
});
// make_chart('resnet50');
// make_chart('densenet181');

// Make tooltips stay up so they can be clicked
const old_hider = c3.chart.internal.fn.hideTooltip;
c3.chart.internal.fn.hideTooltip = function () { };


let chart_count = 0;
function make_chart(options) {
	d3.csv(options.name + ".csv").then(csv => {
		ignore_columns = {
			'git_hash': true,
			'benchmark_time': true,
			'commit_pr': true,
			'run_number': true,
			'commit_time': true,
		};

		let column_names = [];
		let columns = [];
		let name_to_idx = {};

		for (let key in csv[0]) {
			name_to_idx[key] = column_names.length;
			if (!ignore_columns[key]) {
				column_names.push(key);
				columns.push([key]);
			}
		}

		// Get the x-column data
		let x_data = d3.nest()
			.key(d => d['git_hash'])
			.rollup(d => {
				return d[0].commit_time;
			})
			.entries(csv)
		x_data = x_data.map(d => d.value);
		let x_column = ["commit_time"].concat(x_data);
		let data = d3.nest().key(d => d['git_hash']).entries(csv);

		// Get the mean of each column
		for (let i = 0; i < column_names.length; i++) {
			let name = column_names[i];

			let data = d3.nest()
				.key(d => d['git_hash'])
				.rollup(d => {
					return options.rollup(name, d);
				})
				.entries(csv)
			for (let j = 0; j < data.length; j++) {
				columns[i].push(data[j].value);
			}
		}

		columns.push(x_column);

		const div = document.createElement('div');
		div.id = name + '_chart' + chart_count;
		chart_count++;
		document.getElementById('charts').appendChild(div);

		var chart = c3.generate({
			bindto: '#' + div.id,
			data: {
				x: 'commit_time',
				xFormat: '%Y-%m-%d %H:%M:%S',
				columns: columns
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%m-%d'
					},
					label: options.xlabel
				},
				y: {
					label: options.ylabel
				}
			},
			zoom: {
				enabled: true,
				// type: 'drag',
				rescale: true
			},
			title: {
				text: options.title
			},
			tooltip: {
				contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
					let datum = data[d[0].index];
					let items = [
						{
							key: "Git Hash",
							value: datum.key.substr(0, 10)
						}
					];
					let keys = Object.keys(datum.values[0])
						.filter(d => !(d in ignore_columns));
					keys.forEach(key => {
						let value = options.rollup(key, datum.values);
						items.push({
							key: key,
							value: +value.toFixed(2)
						})
					});
					const tooltip = document.createElement('div');
					const table = d3.select(tooltip).append('table')
						.classed('tooltip-table', true);

					const rows = table.append('tbody').selectAll('tr')
						.data(items)
						.enter()
						.append('tr');

					rows.selectAll('td')
					.data((row) => {
						return [row.key, row.value]
					})
					.enter().append('td').text(d => d)

					return tooltip.innerHTML;
				}
			}
		});

	});
}


// new Dygraph(div, 'resnet50.csv', {
// // new Dygraph(div, new URL(window.location + "data.csv"), {
//   legend: 'always',
//   title: 'torchvision.models.resnet50',
//   // showRoller: true,
//   // rollPeriod: 14,
//   visibility: [false, true, true, true],
//   // customBars: true,
//   ylabel: 'Time (ms)',
// 	pointClickCallback: (e, point) => {
// 		console.log(point)
// 	}
// }
// );