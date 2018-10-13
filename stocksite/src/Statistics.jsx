export class Statistics extends React.Component {
    constructor(props) {
        super(props);
        this.calculate = this.calculate.bind(this);
        this.covariance = this.covariance.bind(this);

        this.state = {
            data: props.data,
            statistics: {},
            statNames: []
        };

        this.NUM_DECIMALS = 3;
    }

    calculate() {
        let stats = {};
        let statNames = [];

        let extractor = function (d) {
            return +d.Close;
        };

        let minLength = undefined;

        for (let key in this.state.data) {
            stats[key] = {};
            let dataArray = this.state.data[key].data;
            stats[key]["stddev"] = d3.deviation(this.state.data[key].data, extractor);
            stats[key]["length"] = this.state.data[key].data.length;
            if (!minLength) {
                minLength = stats[key].length;
            } else if (stats[key].length < minLength) {
                minLength = stats[key].length;
            }
            statNames.push(key);
        }

        console.log("LEngth is " + minLength);
        this.minLength = minLength;

        let matrices = {
            correlation: [],
            covariance: []
        };

        let dataLists = this.state.data;

        for (let i = 0; i < statNames.length; i++) {
            matrices.covariance[i] = [];
            for (let j = i; j < statNames.length; j++) {
                matrices.covariance[i][j] = this.covariance(dataLists[statNames[i]].data, extractor,
                    dataLists[statNames[j]].data, extractor)
            }
        }

        for (let i = 0; i < statNames.length; i++) {
            matrices.correlation[i] = [];
            for (let j = i; j < statNames.length; j++) {
                matrices.correlation[i][j]
                    = matrices.covariance[i][j] / (stats[statNames[i]].stddev * stats[statNames[j]].stddev);
            }
        }


        let portfolioVariance = 0;

        for (let i = 0; i < statNames.length; i++) {
            for (let j = i; j < statNames.length; j++) {
                if (i == j) {
                    let weight = this.state.data[statNames[i]];
                    let stddev = stats[statNames[i]].stddev;
                    portfolioVariance += weight * weight * stddev * stddev;
                } else {
                    let weightI = this.state.data[statNames[i]];
                    let stddevI = stats[statNames[i]].stddev;
                    let weightJ = this.state.data[statNames[j]];
                    let stddevJ = stats[statNames[j]].stddev;
                    portfolioVariance += 2 * weightI * weightJ * stddevI * stddevJ;
                }
            }
        }

        let portfolio = {
            variance: portfolioVariance,
            stddev: Math.sqrt(portfolioVariance)
        };

        this.state.statistics = {
            single: stats,
            matrices: matrices,
            names: statNames,
            portfolio: portfolio
        };
        this.state.statNames = statNames;
    }

    covariance(x, xExtractor, y, yExtractor) {
        let xbar = d3.mean(x, xExtractor);
        let ybar = d3.mean(y, yExtractor);


        var summation = 0;
        for (var i = 0; i < this.minLength; i++) {
            summation += (xExtractor(x[i]) - xbar) * (yExtractor(y[i]) - ybar);
            // summation += (x[i] - xbar) * (y[i] - ybar);
        }
        return (1.0 / (this.minLength - 1)) * summation;
    }

    render() {
        this.state.data = this.props.data;
        var f = false;
        for (var key in this.state.data) {
            f = true;
            console.log(key);
        }
        this.calculate();
        let stats = this.state.statistics;
        return (
            <div className="stats">
                <h2>Statistics</h2>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Std. Dev.</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.statNames.map((name, index) => (
                        <tr key={index}>
                            <td>{name}</td>
                            <td>{stats.single[name].stddev.toFixed(this.NUM_DECIMALS)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <h2>Covariance</h2>
                <table className="table">
                    <thead>
                    <tr>
                        <th> </th>
                        {stats.names.map((name, index) => {
                            return (<th>{name}</th>);
                        })}
                    </tr>
                    </thead>
                    <tbody>
                        {stats.names.map((rowName, rowIndex) => {
                            return (
                                <tr>
                                    <th>{rowName}</th>
                                    {stats.names.map((colName, colIndex) => {
                                        let num = stats.matrices.covariance[rowIndex][colIndex];
                                        if (num) num = num.toFixed(this.NUM_DECIMALS);
                                        return (<td>{num}</td>);
                                    })}
                                </tr>
                                );
                        })}
                    </tbody>
                </table>
                <h2>Correlation</h2>
                <table className="table">
                    <thead>
                    <tr>
                        <th> </th>
                        {stats.names.map((name, index) => {
                            return (<th>{name}</th>);
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {stats.names.map((rowName, rowIndex) => {
                        return (
                            <tr>
                                <th>{rowName}</th>
                                {stats.names.map((colName, colIndex) => {
                                    let num = stats.matrices.correlation[rowIndex][colIndex];
                                    if (num) num = num.toFixed(this.NUM_DECIMALS);
                                    return (<td>{num}</td>);
                                })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <h2>Portfolio</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>Std. Dev.</th>
                            <td>
                                {stats.portfolio.stddev.toFixed(this.NUM_DECIMALS)}
                            </td>
                        </tr>
                        <tr>
                            <th>Total Variance</th>
                            <td>
                                {stats.portfolio.variance.toFixed(this.NUM_DECIMALS)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>


        )
    }
}