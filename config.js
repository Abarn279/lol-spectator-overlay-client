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

var blueColorInput = document.getElementById("blue_selected_color");
var redColorInput = document.getElementById("red_selected_color");
var timerTextColorInput = document.getElementById("timer_text_selected_color");
var blueTextColorInput = document.getElementById("blue_text_selected_color");
var redTextColorInput = document.getElementById("red_text_selected_color");
var phaseTextColorInput = document.getElementById("phase_text_selected_color");

var blueColorHex = document.getElementById("blue_color_hex")
var redColorHex = document.getElementById("red_color_hex")
var timerColorHex = document.getElementById("timer_color_hex")
var blueTextColorHex = document.getElementById("blue_text_color_hex")
var redTextColorHex = document.getElementById("red_text_color_hex")
var phaseTextColorHex = document.getElementById("phase_text_color_hex")
var streamTitle = document.getElementById("stream_title")
var homeTeamName = document.getElementById("home_team_name")
var homeTeamAbbr = document.getElementById("home_team_abbr")
var homeTeamSubtext = document.getElementById("home_team_subtext")
var homeTeamScore = document.getElementById("home_team_score")
var awayTeamName = document.getElementById("away_team_name")
var awayTeamAbbr = document.getElementById("away_team_abbr")
var awayTeamSubtext = document.getElementById("away_team_subtext")
var awayTeamScore = document.getElementById("away_team_score")
var whoIsBlueSide = document.getElementById("blue_selector")
var pickingText = document.getElementById("picking_text")

blueColorInput.addEventListener("change", (ev) => {
	blueColorHex.innerHTML = "(" + ev.target.value + ")"
})
redColorInput.addEventListener("change", (ev) => {
	redColorHex.innerHTML = "(" + ev.target.value + ")"
})
timerTextColorInput.addEventListener("change", (ev) => {
	timerColorHex.innerHTML = "(" + ev.target.value + ")"
})
blueTextColorInput.addEventListener("change", (ev) => {
	blueTextColorHex.innerHTML = "(" + ev.target.value + ")"
})
redTextColorInput.addEventListener("change", (ev) => {
	redTextColorHex.innerHTML = "(" + ev.target.value + ")"
})
phaseTextColorInput.addEventListener("change", (ev) => {
	phaseTextColorHex.innerHTML = "(" + ev.target.value + ")"
})

var enableCustomNamesInput = document.getElementById("enable_custom_names")
var enableTransparent = document.getElementById('enable_transparent')

var swapNamesButton = document.getElementById("swap")
swapNamesButton.addEventListener("click", function () {
	var tmp = summonerNameInput1.value
	summonerNameInput1.setAttribute("value", summonerNameInput6.value)
	summonerNameInput6.setAttribute("value", tmp)
	tmp = summonerNameInput2.value
	summonerNameInput2.setAttribute("value", summonerNameInput7.value)
	summonerNameInput7.setAttribute("value", tmp)
	tmp = summonerNameInput3.value
	summonerNameInput3.setAttribute("value", summonerNameInput8.value)
	summonerNameInput8.setAttribute("value", tmp)
	tmp = summonerNameInput4.value
	summonerNameInput4.setAttribute("value", summonerNameInput9.value)
	summonerNameInput9.setAttribute("value", tmp)
	tmp = summonerNameInput5.value
	summonerNameInput5.setAttribute("value", summonerNameInput10.value)
	summonerNameInput10.setAttribute("value", tmp)
})

var summonerNameInput1 = document.getElementById("summonerName1")
var summonerNameInput2 = document.getElementById("summonerName2")
var summonerNameInput3 = document.getElementById("summonerName3")
var summonerNameInput4 = document.getElementById("summonerName4")
var summonerNameInput5 = document.getElementById("summonerName5")
var summonerNameInput6 = document.getElementById("summonerName6")
var summonerNameInput7 = document.getElementById("summonerName7")
var summonerNameInput8 = document.getElementById("summonerName8")
var summonerNameInput9 = document.getElementById("summonerName9")
var summonerNameInput10 = document.getElementById("summonerName10")


ipc.on("newConfig", (event, newConfig) => {
	console.log("newConfig", newConfig)
	config = newConfig;
	blueColorInput.setAttribute("value", config.blueColor)
	redColorInput.setAttribute("value", config.redColor)
	timerTextColorInput.setAttribute("value", config.timerColor)
	blueTextColorInput.setAttribute("value", config.blueTextColor)
	redTextColorInput.setAttribute("value", config.redTextColor)
	phaseTextColorInput.setAttribute("value", config.phaseTextColor)

	streamTitle.setAttribute("value", config.streamTitle);
	homeTeamName.setAttribute("value", config.homeTeamName)
	homeTeamAbbr.setAttribute("value", config.homeTeamAbbr)
	homeTeamSubtext.setAttribute("value", config.homeTeamSubtext)
	homeTeamScore.setAttribute("value", config.homeTeamScore);
	awayTeamName.setAttribute("value", config.awayTeamName)
	awayTeamAbbr.setAttribute("value", config.awayTeamAbbr)
	awayTeamSubtext.setAttribute("value", config.awayTeamSubText)
	awayTeamScore.setAttribute("value", config.awayTeamScore)
	whoIsBlueSide.setAttribute("value", config.whoIsBlueSide)
	pickingText.setAttribute("value", config.pickingText)

	enableCustomNamesInput.setAttribute("checked", config.enableCustomNames)
	enableTransparent.setAttribute("checked", config.enableTransparent)

	blueColorHex.innerHTML = "(" + config.blueColor + ")"
	redColorHex.innerHTML = "(" + config.redColor + ")"
	timerColorHex.innerHTML = "(" + config.timerColor + ")"
	blueTextColorHex.innerHTML = "(" + config.blueTextColor + ")"
	redTextColorHex.innerHTML = "(" + config.redTextColor + ")"
	phaseTextColorHex.innerHTML = "(" + config.phaseTextColor + ")"
});

ipc.send("getConfig")

var updateButton = document.getElementById("update")
updateButton.addEventListener("click", function () {
	var blueColorInput = document.getElementById("blue_selected_color");
	var redColorInput = document.getElementById("red_selected_color");
	var timerTextColorInput = document.getElementById("timer_text_selected_color");
	ipc.send("newConfig", {
		blueColor: blueColorInput.value,
		redColor: redColorInput.value,
		timerColor: timerTextColorInput.value,
		blueTextColor: blueTextColorInput.value,
		redTextColor: redTextColorInput.value,
		phaseTextColor: phaseTextColorInput.value,
		enableCustomNames: enableCustomNamesInput.checked,
		names: [
			summonerNameInput1.value,
			summonerNameInput2.value,
			summonerNameInput3.value,
			summonerNameInput4.value,
			summonerNameInput5.value,
			summonerNameInput6.value,
			summonerNameInput7.value,
			summonerNameInput8.value,
			summonerNameInput9.value,
			summonerNameInput10.value,
		],
		streamTitle: streamTitle.value,
		homeTeamName: homeTeamName.value,
		homeTeamAbbr: homeTeamAbbr.value,
		homeTeamSubtext: homeTeamSubtext.value,
		homeTeamScore: homeTeamScore.value,
		awayTeamName: awayTeamName.value,
		awayTeamAbbr: awayTeamAbbr.value,
		awayTeamSubtext: awayTeamSubtext.value,
		awayTeamScore: awayTeamScore.value,
		whoIsBlueSide: whoIsBlueSide.value,
		pickingText: pickingText.value,
		enableTransparent: enableTransparent.checked
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