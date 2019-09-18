make_chart('resnet50');
// make_chart('resnet50');
// make_chart('densenet181');

// Make tooltips stay up so they can be clicked
const old_hider = c3.chart.internal.fn.hideTooltip;
c3.chart.internal.fn.hideTooltip = function () { };


function make_chart(name) {
	d3.csv(name + ".csv").then(csv => {
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
		let x_column = ["commit_time"].concat(x_data)

		// Get the mean of each column
		for (let i = 0; i < column_names.length; i++) {
			let name = column_names[i];

			let data = d3.nest()
				.key(d => d['git_hash'])
				.rollup(d => {
					return d3.mean(d, x => x[name]);
				})
				.entries(csv)
			for (let j = 0; j < data.length; j++) {
				columns[i].push(data[j].value);
			}
		}

		columns.push(x_column);

		const div = document.createElement('div');
		div.id = name + '_chart';
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
					}
				}
			},
			zoom: {
				enabled: true,
				// type: 'drag'
			},
			title: {
				text: name
			},
			tooltip: {
				contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
					let item_obj = csv[d[0].index];
					let items = [];
					for (let key in item_obj) {
						if (key == 'git_hash') {
							items.push({
								"key": 'Git Hash',
								"value": item_obj[key].substr(0, 10)
							});
							continue;
						}
						if (ignore_columns[key]) {
							continue;
						}
						let value = +item_obj[key];
						items.push({
							"key": key,
							"value": +value.toFixed(2)
						})
					}
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