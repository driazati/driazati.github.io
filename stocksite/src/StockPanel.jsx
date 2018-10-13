export class StockPanel extends React.Component {
    constructor(props) {
        super();
        this.rowPreview = this.rowPreview.bind(this);
        this.state = {
            data: [],
            weight: 0
        };
        let container = this;
        this.state.weight = props.weight;
        d3.csv(props.csv, function (rows) {
            container.state.data = rows;
            container.setState(container.state);
        });
    }

    rowPreview(url) {
        if (!url) {
            this.state.data = [];
            // this.setState(this.state);
            return;
        }
        var container = this;
        d3.csv(url, function (rows) {
            container.state.data = rows;
            container.setState(container.state);
        });
    }

    render() {
        const preview = this.state.data.slice(0, 3);
        var count = 1;
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading"><b>{this.props.name}</b></div>
                    <div className="panel-body">
                        <p>
                            Weight: {this.props.weight * 100}%
                        </p>
                        <p>
                            Data preview:
                        </p>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Row</th>
                                    <th>Date</th>
                                    <th>Open</th>
                                    <th>High</th>
                                    <th>Low</th>
                                    <th>Close</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    preview.map((row, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{count++}</td>
                                                    <td>{row.Date}</td>
                                                    <td>{row.Open}</td>
                                                    <td>{row.High}</td>
                                                    <td>{row.Low}</td>
                                                    <td>{row.Close}</td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>

                            </table>

                        </div>
                    </div>
                </div>
            </div>

        );
    }
}