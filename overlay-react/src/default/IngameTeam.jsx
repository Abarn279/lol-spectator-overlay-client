import React from "react";

export default class IngameTeam extends React.Component {
	static defaultProps = {
		abbr: "",
		score: null
	}
	render() {
		return (
			<div className="ingame-team">
				{this.props.abbr && this.props.score &&
					<>{this.props.abbr} - {this.props.score}</>
				}
			</div>
		);
	}
}
