const electron = require("electron")
const fs = require('fs');
const ipc = electron.ipcRenderer

var updateImages = document.getElementById("updateImages")

var consoleDiv = document.getElementById("my_console")

function log(...args) {
	args.forEach(arg => consoleDiv.innerHTML += arg + "\n")
}

if (!fs.existsSync('./logs')) {
	fs.mkdirSync('./logs', { recursive: true });
}

document.getElementById("startBtn").addEventListener("click", () => {
	ipc.send("open-overlay", null)
	document.getElementById("stopOverlayBtn").disabled = false;
})

ipc.on('overlay-stopped', (event, args) => {
	document.getElementById("stopOverlayBtn").disabled = true;
})

document.getElementById("loadReplayBtn").addEventListener("click", () => {

	ipc.invoke('load-replay-dialog').then(result => {
		console.log(result)
		log("Replay loaded from " + result)
	})

	document.getElementById('connectToClientBtn').disabled = false;
})

document.getElementById('connectToClientBtn').addEventListener('click', () => {
	ipc.invoke("connect-to-client").then(res => {
		log("Connected to client.")
	})

	document.getElementById('connectToClientBtn').disabled = true;
})

updateImages.addEventListener('click', () => {
	ipc.invoke('update-images').then(result => {
		log("Images updated.")
	})
})

/* Start - Team Selector */
var teams = require('./teams.json').teams;
var teamSelectorContainer = document.getElementById("team-selector");

for (var i = 0; i < 2; i++) {
	var select = document.getElementById(i == 0 ? 'home-team-select': 'away-team-select');

	teams.forEach((item, idx) => {
		let option = document.createElement('option');
		option.value = idx;
		option.textContent = item.name;

		select.appendChild(option)
	})
}

/* START - TIMER */
var timerInput = document.getElementById("timer_input");
var timerStart = document.getElementById("timer_start");
var timerRep = document.getElementById("timer_rep");
const timerPattern = /^\d\d?:\d\d$/

var secondsLeft = 0;

timerStart.addEventListener('click', (e) => {
	let currentTime = timerInput.value;

	// return if the regex fails
	if (!timerPattern.test(currentTime)) return;

	var [minutes, seconds] = currentTime.split(':');

	// seconds can't be over 59
	if (+seconds > 59) return;

	secondsLeft = +seconds + +minutes * 60;
});

setInterval(() => {
	if (secondsLeft > 0) {
		secondsLeft -= 1;
		ipc.send("timerUpdated", secondsLeft);
		timerRep.innerHTML = `${Math.floor(secondsLeft / 60)}:${secondsLeft % 60}`;
	}
}, 1000)
/* END - TIMER */

var streamTitle = document.getElementById("stream_title")
var homeTeamScore = document.getElementById("home_team_score")
var awayTeamScore = document.getElementById("away_team_score")
var whoIsBlueSide = document.getElementById("blue_selector")

ipc.on("newConfig", (event, newConfig) => {
	console.log("newConfig", newConfig)
	config = newConfig;

	streamTitle.setAttribute("value", config.streamTitle);
	homeTeamScore.setAttribute("value", config.homeTeamScore);
	awayTeamScore.setAttribute("value", config.awayTeamScore)
	whoIsBlueSide.setAttribute("value", config.whoIsBlueSide)
});

ipc.send("getConfig")

var updateButton = document.getElementById("update")
updateButton.addEventListener("click", function () {
	ipc.send("newConfig", {
		streamTitle: streamTitle.value,
		homeTeamId: document.getElementById('home-team-select').value,
		homeTeamScore: homeTeamScore.value,
		awayTeamId: document.getElementById('away-team-select').value,
		awayTeamScore: awayTeamScore.value,
		whoIsBlueSide: whoIsBlueSide.value,
	})
})


var statusWebServer = document.getElementById("statusWebServer")
var statusWebSocketServer = document.getElementById("statusWebSocketServer")
var statusClient = document.getElementById("statusClient")

ipc.on("serverStatus", (event, status) => {
	statusWebServer.innerHTML = "Web Server: " + status.webServer
	statusWebSocketServer.innerHTML = "Web Socket Server: " + status.webSocketServer
	statusClient.innerHTML = "Client: " + status.leagueClient

	statusWebServer.style.backgroundColor = status.webServer == "Running" ? "var(--online-color)" : "var(--offline-color)"
	statusWebSocketServer.style.backgroundColor = status.webSocketServer == "Running" ? "var(--online-color)" : "var(--offline-color)"
	statusClient.style.backgroundColor = status.leagueClient == "Connected" ? "var(--online-color)" : "var(--offline-color)"
})