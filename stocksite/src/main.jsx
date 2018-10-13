const {createElement} = React
const {render} = ReactDOM
import {SkiDayCount} from './SkiDayCount';
import {StockPanel} from './StockPanel';
import {Statistics} from './Statistics';

window.React = React;

class App extends React.Component {
    constructor() {
        super();
        this.readCSV = this.readCSV.bind(this);
        this.addCSV = this.addCSV.bind(this);
        this.aggregateData = this.aggregateData.bind(this);
        this.validateInput = this.validateInput.bind(this);

        this.state = {
            stocks: [

            ],
            stats: {},
            validated: false
        };
    }

    readCSV(url, submission) {
        var converter = this.rowToHTML;
        // d3.csv(url, function (rows) {
        //     console.log(rows[0]);
        //     d3.select("body").append("b").html(converter(rows[0]));
        // });

        // this.state.stocks.push(
        //
        // );
        this.state.stocks.push({
            name: submission.name,
            weight: submission.weight,
            csv: url
        });
        this.setState(this.state);
    }

    addCSV(e) {
        e.preventDefault();
        var submission = {
            name: this.refs.stockname.value,
            csv: this.refs.csvfile,
            weight: +this.refs.stockweight.value
        };

        var csvInput = this.refs.csvfile;
        var file = csvInput.files[0];
        if (file) {
            var reader = new FileReader();
            var callback = this.readCSV;
            reader.onloadend = function (event) {
                var dataUrl = event.target.result;

                callback(dataUrl, submission);
            };
            reader.readAsDataURL(file);
        }
        this.refs.stockname.value = "";
        this.refs.csvfile.value = "";
        this.refs.stockweight.value = "";
    }

    aggregateData() {
        var stats = {};
        for (var key in this.refs) {
            // if (this.refs[key])
            if (this.refs[key] instanceof StockPanel) {
                stats[key] = {
                    weight: this.refs[key].state.weight,
                    data: this.refs[key].state.data
                };
            }
        }
        this.state.stats = stats;
        this.setState(this.state);

        // this.forceUpdate();
    }

    validateInput() {
        console.log("checking")
        if (!this.refs.stockname || !this.refs.csvfile || !this.refs.stockweight) return false;
        var submission = {
            name: this.refs.stockname.value,
            csv: this.refs.csvfile,
            weight: this.refs.stockweight.value
        };
        if (!submission.weight || isNaN(submission.weight)
            || +submission.weight > 1 || +submission.weight < 0) return false;
        if (!submission.name || submission.name.length == 0) return false;
        if (submission.csv.files.length == 0) return false;
        console.log("good 2 go")
        this.state.validated = true;
        this.setState(this.state);
        return true;
    }

    render() {
        return (
            <div className="container">
                <h1>Portfolio Calculator</h1>
                <div className="row" style={{margin: 0}}>
                    <div className="col">
                        <form className="form stock-form" onSubmit={this.addCSV} onChange="">
                            <label for="csvfile">Upload a Yahoo! Finance CSV download</label>
                            <input onChange={this.validateInput} ref="csvfile" id="csvfile" type="file" accept=".csv"/>
                            <label for="stockname">Name</label>
                            <input onChange={this.validateInput} className="form-control" ref="stockname" id="stockname" placeholder="APPL" />
                            <label  for="stockweight">Specify portfolio weight (as decimal)</label>
                            <input onChange={this.validateInput} className="form-control" type="number" ref="stockweight" placeholder="0.30" step="0.001" id="stockweight" />
                            <button disabled={!this.state.validated} className="btn btn-info">Add</button>
                        </form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-8" style={{margin: 0}}>
                        {
                            this.state.stocks.map((item, index) => {
                                return (<StockPanel
                                    key={index}
                                    name={item.name}
                                    weight={item.weight}
                                    csv={item.csv}
                                    ref={item.name} />);
                            })
                        }
                    </div>
                    <div className="col-sm-4" style={{margin: 0, "textAlign": "center"}}>
                        <h1>Calculations</h1>
                        <button className="btn btn-primary" onClick={this.aggregateData}>Calculate</button>
                        <Statistics data={this.state.stats}/>
                    </div>
                </div>
            </div>

        );
    }
}

render(
    <App />,
    document.getElementById('react-container')
);