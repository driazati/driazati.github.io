const { createClass } = React;

// export const SkiDayCount = React.createClass({
export class SkiDayCount extends React.Component {
    constructor(props) {
        super();
        this.submit = this.submit.bind(this);
    }
    submit(e) {
        e.preventDefault();
        console.log(this.refs);
        testFunc(this.refs.whodat.value);
        this.refs.whodat.value = "";
    }
    render() {
        return (
            <form onSubmit={this.submit}>
                <input id="lol" ref="whodat" />
                <button>Submit</button>
            </form>
        )
    }
};