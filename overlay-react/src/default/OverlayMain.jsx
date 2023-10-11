import React, { useEffect } from "react";
import cx from "classnames";

import Ban from "./Ban";
import "./index.css";
import "./style/index_alt.css"
import Pick from "./Pick";
import Timer from "./Timer";
import ReconnectingWebSocket from "reconnecting-websocket"
import IngameTeam from "./IngameTeam";

const teams = {
	0: { name: "Penguin Pajama Party", captain: "Abarn", acronym: "PPP", },
	1: { name: "Tails Never Fails", captain: "Lemonilla", acronym: "TNF" },
	2: { name: "Drink More Water", captain: "Swiss", acronym: "DMW" },
	3: { name: "Snakerdoodles", captain: "Bush League", acronym: "SNEK" },
	4: { name: "Beautiful Mutant Sausages", captain: "IREP", acronym: "BMS" },
	5: { name: "Ride or Die", captain: "Rudy", acronym: "RoD" }
}

export default class Overlay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showView: 0,
			showInGameOverlay: true,
			started: false,
			timerRemaining: 0,
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
			streamTitle: "TITLE",
			blueColor: "#0b849e",
			redColor: "#be1e37",
			timerColor: "#ffffff",
			blueTextColor: "#fff",
			redTextColor: "#fff",
			phaseTextColor: "#fff",
			homeTeamId: 0,
			homeTeamScore: 0,
			awayTeamId: 0,
			awayTeamScore: 0,
			whoIsBlueSide: "home",
			pickingText: "Picking",
			enableTransparent: false,
		}
	}


	componentDidMount() {

		// Set view for this instance
		let viewparam = new URLSearchParams(window.location.search).get('view');
		let intendedView
		if (viewparam && [0, 1, 2].includes(Number.parseInt(+viewparam))) {
			intendedView = +viewparam;
		} else {
			intendedView = 0;
		}
		this.setState({ ...this.state, showView: +viewparam });

		// Set up socket connection
		let ws = new ReconnectingWebSocket(`ws://${this.props.backend}`)
		ws.onmessage = (msg) => {
			var msgJson = JSON.parse(msg.data)
			console.log(msgJson);
			if (msgJson.event === "championSelectStarted") {
				this.champSelectEnded = false
			}

			if (msgJson.event === "newState") {
				if (!msgJson || !msgJson.data) return;
				this.setState(msgJson.data)
			}

			if (msgJson.event === "championSelectEnded") {
				console.log("champSelectEnded")
			}

			if (msgJson.event === "newConfig") {
				if (!msgJson || !msgJson.data) return;
				this.config = msgJson.data

				if (!["home", "away"].includes(this.config.whoIsBlueSide)) throw new Error("Must have who is blue side!");
				var homeIsBlue = this.config.whoIsBlueSide === 'home';

				this.config.homeTeam = teams[this.config.homeTeamId]
				this.config.awayTeam = teams[this.config.awayTeamId]

				// set blue in config
				this.config.blueTeam = homeIsBlue ? teams[this.config.homeTeamId] : teams[this.config.awayTeamId]
				this.config.blueTeamScore = homeIsBlue ? this.config.homeTeamScore : this.config.awayTeamScore;

				// set red in config
				this.config.redTeam = !homeIsBlue ? teams[this.config.homeTeamId] : teams[this.config.awayTeamId]
				this.config.redTeamScore = !homeIsBlue ? this.config.homeTeamScore : this.config.awayTeamScore;

				this.setState(this.state)
			}

			if (msgJson.event === "showIngameOverlay") {
				this.setState({ ...this.state, showInGameOverlay: true })
			}

			if (msgJson.event === "hideIngameOverlay") {
				this.setState({ ...this.state, showInGameOverlay: false })
			}

			if (msgJson.event === "selectView") {
				this.setState({ ...this.state, showView: msgJson.data })
			}

			if (msgJson.event === "timerUpdated") {
				this.setState({ ...this.state, timerRemaining: msgJson.data })
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

		const getTimerRep = () => {
			var secondsLeft = this.state.timerRemaining;
			if (secondsLeft === 0) return '00:00';

			var minutesLeft = Math.floor(secondsLeft / 60).toString();
			if (minutesLeft.length === 1) minutesLeft = '0' + minutesLeft;

			secondsLeft = (secondsLeft % 60).toString();
			if (secondsLeft.length === 1) secondsLeft = '0' + secondsLeft;
			console.log(`${minutesLeft}:${secondsLeft}`)
			return `${minutesLeft}:${secondsLeft}`;
		}

		switch (this.state.showView) {
			case 0:
				return <div className="starting-soon">
					<h1>{this.config.streamTitle}</h1>
					<div className="starting-soon-timer">
						{getTimerRep()}
					</div>
					{this.config.homeTeamId && this.config.awayTeamId && (
						<div className="starting-soon-teams">
							<img class="home" src={require(`../assets/team-logos/${this.config.homeTeamId}.png`).default} />
							<img class="away" src={require(`../assets/team-logos/${this.config.awayTeamId}.png`).default} />
						</div>
					)}
					{this.config.homeTeam && this.config.awayTeam && (
						<div className="captains">
							<div className="home">
								<img src={require(`../assets/headshots/${this.config.homeTeamId}.png`).default} />
								<div>{this.config.homeTeam.captain}</div>
							</div>
							<div className="away">
								<img src={require(`../assets/headshots/${this.config.awayTeamId}.png`).default} />
								<div>{this.config.awayTeam.captain}</div>
							</div>
						</div>
					)}
				</div>
			case 1:
				return (
					<div
						className="overlay"
						style={style} //{{ width: 1280, height: 720 ,zoom:1.25 }}
						className={cx("overlay", this.state.actingSide + "-acting", { "transparent": true })}
					>
						<div className="champion-select-header">
							{this.config.blueTeam && (
								<div className="blue-team-info">
									<h1>{this.config.blueTeam.name}</h1>
									<h5>{this.config.blueTeam.captain}</h5>
								</div>
							)}

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
							{this.config.redTeam && (
								<div className="red-team-info">
									<h1>{this.config.redTeam.name}</h1>
									<h5>{this.config.redTeam.captain}</h5>
								</div>
							)}
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
			case 2:
				return this.state.showInGameOverlay
					? <div className="ingame-overlay">
						{/* <img style={ {position: "absolute"}} src={require("../assets/ingameoverlay.png").default} /> */}
						<video width="1920" height="1080" autoPlay loop>
							<source src={require("../assets/overlay.webm").default} />
						</video>
						{this.config.blueTeam && this.config.redTeam && (
							<div class="teams">
								<IngameTeam abbr={this.config.blueTeam.acronym} score={this.config.blueTeamScore} />
								<IngameTeam abbr={this.config.redTeam.acronym} score={this.config.redTeamScore} />
							</div>
						)}
						<div class="ingame-stream-title">{this.config.streamTitle}</div>
						{/* <div class="ingame-logo-holder">
							<img src={require("../assets/mini.png").default} />
						</div> */}
					</div>
					: <></>
			// case 3:
			// 	return <div className="starting-soon">
			// 		<div className="starting-soon-timer analyst">
			// 			{getTimerRep()}
			// 		</div>
			// 		<div className="starting-soon-teams analyst">
			// 			<div>{this.config.homeTeam.acronym} - {this.config.homeTeamScore}</div>
			// 			<div>vs.</div>
			// 			<div>{this.config.awayTeam.acronym} - {this.config.awayTeamScore}</div>
			// 		</div>
			// 	</div>
			default:
				return <></>
		}

	}
}
