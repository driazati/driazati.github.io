make_chart('resnet50');
// make_chart('resnet50');
// make_chart('densenet181');

// Make tooltips stay up so they can be clicked
const old_hider = c3.chart.internal.fn.hideTooltip;
c3.chart.internal.fn.hideTooltip = function () { };


function make_chart(name) {
	d3.csv(name + ".csv").then(csv => {
		columns = [];
		ignore_columns = {
			'git_hash': true
		};
		name_to_idx = {};
		for (let key in csv[0]) {
			name_to_idx[key] = columns.length;
			if (!ignore_columns[key]) {
				columns.push([key])
			}
		}

		for (let i = 0; i < csv.length; i++) {
			for (let key in csv[i]) {
				const index = name_to_idx[key];
				if (!ignore_columns[key]) {
					columns[index].push(csv[i][key])
				}
			}
		}
		const div = document.createElement('div');
		div.id = name + '_chart';
		document.getElementById('charts').appendChild(div);

		var chart = c3.generate({
			bindto: '#' + div.id,
			data: {
				x: 'time',
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
						items.push({
							"key": key,
							"value": item_obj[key]
						})
					}
					const tooltip = document.createElement('div');
					const table = d3.select(tooltip).append('table');

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