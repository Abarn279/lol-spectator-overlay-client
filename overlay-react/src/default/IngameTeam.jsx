import React from "react";

export default class IngameTeam extends React.Component {
	static defaultProps = {
		abbr: "TSM",
        score: 0
	}
	render() {
		return (
			<div className="ingame-team">
                {this.props.abbr} - {this.props.score}
			</div>
		);
	}
}
