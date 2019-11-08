make_chart({
	data_file: 'data/resnet50.json',
	div_id: 'basic',
	xlabel: 'Commit Time',
	ylabel: 'Milliseconds',
	title: 'Basic',
	rollups: [
		{
			"name": "mean",
			"fn": d3.mean
		},
		{
			"name": "variance",
			"fn": d3.variance
		}
	]
});

// Make tooltips stay up so they can be clicked
const old_hider = c3.chart.internal.fn.hideTooltip;
c3.chart.internal.fn.hideTooltip = function () { };


function make_chart(options) {
	d3.json(options.data_file).then(json => {
		let rollup = options.rollups[0];

		// commit hash -> { ... }

		// ['commit_time', a, b, c]
		// ['metric 1', a_m1, b_m1, c_m1]
		json.forEach(d => {
			d.commit.time = new Date(d.commit.time)
		})

		// Get the data for each time step for the x-axis
		let x_data = json.map(d => d.commit.time);
		let x_column = ["commit_time"].concat(x_data);

		let all_series = [x_column];

		let sample_entry = json[0].runs[0];
		let fields = Object.keys(sample_entry).filter(d => d !== 'benchmark_run_at')
		for (let i = 0; i < fields.length; i++) {
			let series = [fields[i]];

			json.forEach(d => {
				let value = rollup.fn(d.runs[0][fields[i]]);
				series.push(value);
			})

			all_series.push(series);
		}

		var chart = c3.generate({
			bindto: '#' + options.div_id,
			data: {
				x: 'commit_time',
				xFormat: '%Y-%m-%dT%H:%M:%S%z',
				// xFormat: '%Y-%m-%d %H:%M:%S',
				columns: all_series
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
					let datum = json[d[0].index];

					let items = [
						{
							key: "Git Hash",
							value: datum.commit.hash.substr(0, 10)
						}
					];

					for (let i = 0; i < fields.length; i++) {
						let value = rollup.fn(datum.runs[0][fields[i]]);

						items.push({
							"key": fields[i],
							"value": +value.toFixed(2)
						});
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