import React, { useEffect } from "react";
import cx from "classnames";

// import css from './style/index.less';
import Ban from "./Ban";
import "./index.css";
import "./style/index_alt.css"
import Pick from "./Pick";
import Timer from "./Timer";
import ReconnectingWebSocket from "reconnecting-websocket"
import IngameTeam from "./IngameTeam";

export default class Overlay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			gameStarted: false,
			started: false,
			bluePicks: [
				{},
				{},
				{},
				{},
				{},
			],
			redPicks: [
				{
					championId: 0,
					picking: true,
				},
				{},
				{},
				{},
				{},
			],

			blueBans: [
				{}, {}, {}, {}, {},
			],
			redBans: [
				{}, {}, {}, {}, {},
			],
			phase: "Pick Phase 1",
			actingSide: "blue",
		};
		this.config = {
			blueColor: "#0b849e",
			redColor: "#be1e37",
			timerColor: "#ffffff",
			blueTextColor: "#fff",
			redTextColor: "#fff",
			phaseTextColor: "#fff",
			blueTeamName: "",
			blueTeamAbbr: "",
			blueTeamSubtext: "",
			redTeamName: "",
			redTeamAbbr: "",
			redTeamSubText: "",
			pickingText: "Picking",
			enableTransparent: false,
		}
	}


	componentDidMount() {
		let ws = new ReconnectingWebSocket(this.props.backend)
		ws.onmessage = (msg) => {
			var msgJson = JSON.parse(msg.data)
			if (msgJson.event === "championSelectStarted") {
				this.champSelectEnded = false
			}

			if (msgJson.event === "newState") {
				console.log(this)
				this.setState(msgJson.data)
			}

			if (msgJson.event === "championSelectEnded") {
				console.log("champSelectEnded")
			}

			if (msgJson.event === "newConfig") {
				console.log(msgJson.data)
				this.config = msgJson.data
				this.setState(this.state)
			}

			if (msgJson.event === "startGame") {
				this.setState({ ...this.state, gameStarted: true })
				console.log(this.state);
			}

			if (msgJson.event === "endGame") {
				console.log("Game ended");
				this.setState({ ...this.state, gameStarted: false })
			}
		}
	}

	render() {
		var bluePicks = [];
		var redPicks = [];

		if (this.state.bluePicks) {
			if (this.config.enableCustomNames) {
				bluePicks = this.state.bluePicks.map((pick, index) => (
					<Pick key={"pick-" + index} {...pick} summonerName={this.config.names[index]} pickingText={this.config.pickingText} />
				));
			}
			else {
				bluePicks = this.state.bluePicks.map((pick, index) => (
					<Pick key={"pick-" + index} {...pick} pickingText={this.config.pickingText} />
				));
			}
		}

		if (this.state.redPicks) {
			if (this.config.enableCustomNames) {
				redPicks = this.state.redPicks.map((pick, index) => (
					<Pick key={"pick-" + index} {...pick} summonerName={this.config.names[index + 5]} pickingText={this.config.pickingText} />
				));
			}
			else {
				redPicks = this.state.redPicks.map((pick, index) => (
					<Pick key={"pick-" + index} {...pick} pickingText={this.config.pickingText} />
				));
			}
		}

		var blueBans = [];
		var redBans = [];

		if (this.state.blueBans) {
			blueBans = this.state.blueBans.map((ban, index) => (
				<Ban key={"ban-" + index} {...ban} />
			));
		}
		if (this.state.redBans) {
			redBans = this.state.redBans.map((ban, index) => (
				<Ban key={"ban-" + index} {...ban} />
			));
		}

		var style = {
			"--left-side-color": this.config.blueColor, "--right-side-color": this.config.redColor, "--timer-color": this.config.timerColor, "width": 1280, "height": 720, "zoom": 1.5,
			"--left-side-text-color": this.config.blueTextColor, "--right-side-text-color": this.config.redTextColor, "--phase-text-color": this.config.phaseTextColor
		};

		if (!this.state.gameStarted) {
			return (
				<div
					className="overlay"
					style={style} //{{ width: 1280, height: 720 ,zoom:1.25 }}
					className={cx("overlay", this.state.actingSide + "-acting", { "transparent": this.config.enableTransparent })}
				>
					<div className="champion-select-header">
						<div className="blue-team-info">
							<h1>{this.config.blueTeamName}</h1>
							<h5>{this.config.blueTeamSubtext}</h5>
						</div>
						<Timer
							side="blue"
							visible={
								this.state.actingSide === "blue" ||
								this.state.actingSide === "none"
							}
							time={this.state.time}
							actingSide={this.state.actingSide}
							timestamp={this.state.timestamp}
						/>
						<div className="header-keystone">
							<div className="left-bg-section"></div>
							<div className="right-bg-section"></div>
							<div className="header-keystone-inner">
								<div className="left-bg-section"></div>
								<div className="right-bg-section"></div>
								<div className={cx("phase", { "transparent": this.state.phase === "" })} >{this.state.phase}</div>
							</div>
						</div>

						<Timer
							side="red"
							visible={
								this.state.actingSide === "red" ||
								this.state.actingSide === "none"
							}
							time={this.state.time}
							actingSide={this.state.actingSide}
							timestamp={this.state.timestamp}
						/>
						<div className="red-team-info">
							<h1>{this.config.redTeamName}</h1>
							<h5>{this.config.redTeamSubText}</h5>
						</div>
					</div>

					<div className="party" id="blueParty">
						{bluePicks}
					</div>

					<div className="party" id="redParty">
						{redPicks}
					</div>

					<div className="champSelectFooter">
						<div className="bans" id="blueBans">
							{blueBans}
						</div>

						<div className="bans" id="redBans">
							{redBans}
						</div>
					</div>
				</div>
			);
		}
		else {
			return <div className="ingame-overlay">
				<img src={require("../assets/ingameoverlay.png").default} />
				<div class="teams">
					<IngameTeam abbr="ABC" score={0} />
					<IngameTeam abbr="DEF" score={0} />
				</div>
			</div>
		}
	}
}
