import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from "path";
import EventEmitter from "events"
import mergePatch from "json8-merge-patch"
import * as fs from "fs"
import express from "express"
import { checkForNewChampionImages } from './downloadImages';
import MyWebSocketServer from './WebSocketServer';
const ioHook = require('iohook');

const WEBSERVER_PORT = 36501
const WEBSOCKET_SERVER_PORT = 36502
var server;
var serverSocket;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let winConf: BrowserWindow

function createConfigWindow() {
    winConf = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: true,
    })

    // and load the index.html of the app.
    // winConf.loadFile('config.html')
    winConf.loadFile(path.join(__dirname, '../config.html'));
    // Open the DevTools.
    winConf.webContents.openDevTools()

    // Emitted when the window is closed.
    winConf.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        winConf = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', () => {
    createConfigWindow();
    const firstTimeFilePath = path.resolve(app.getPath('userData'), '.first-time-huh');
    let isFirstTime;
    try {
        fs.closeSync(fs.openSync(firstTimeFilePath, 'wx'));
        isFirstTime = true;
    } catch (e) {
        if (e.code === 'EEXIST') {
            isFirstTime = false;
        } else {
            // something gone wrong
            throw e;
        }
    }
    if (isFirstTime) {
        checkForNewChampionImages();
    }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("open-overlay", function (event, arg) {
    shell.openExternal("http://localhost:" + WEBSERVER_PORT)
})

ipcMain.handle("connect-to-client", async (event) => {
    api.connectToClient();
    return true;
})

server = express();

console.log(path.join(__dirname, "..", "build"));
server.use(express.static(path.join(__dirname, "..", "build")));

serverSocket = server.listen(WEBSERVER_PORT, () => {
    console.log("server started om port " + WEBSERVER_PORT)
})

var webSocketServer = new MyWebSocketServer(WEBSOCKET_SERVER_PORT, 'localhost');

webSocketServer.start();

var api = webSocketServer.getStateApi();

var config = {};
fs.readFile(path.join(__dirname, "..", "config.json"), { encoding: "utf8" }, (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    var newConfig = JSON.parse(data)
    config = mergePatch.apply(config, newConfig)
    console.log("readConfig", config)
    winConf.webContents.send("newConfig", config)
})
var configEventEmitter = new EventEmitter();

ipcMain.on("newConfig", (event, newConfig) => {
    config = mergePatch.apply(config, newConfig);
    console.log("on newConfig", config)
    fs.writeFile(path.join(__dirname, "..", "config.json"), JSON.stringify(config), (err) => { console.log(err) })

    configEventEmitter.emit("newConfig", config)
});

configEventEmitter.addListener("newConfig", (config) => {
    webSocketServer.sendToAllClients(JSON.stringify({ "event": "newConfig", "data": config }))
})


ipcMain.on("getConfig", () => {
    winConf.webContents.send("newConfig", config)
})

ipcMain.handle('update-images', () => {
    console.log("update images")
    checkForNewChampionImages();
});

/* Begin: Start/end game */
ipcMain.on("startGame", () => {
    webSocketServer.sendToAllClients(JSON.stringify({ "event": "startGame", "data": {} }))
})

ipcMain.on("endGame", () => {
    webSocketServer.sendToAllClients(JSON.stringify({ "event": "endGame", "data": {} }))
})
/* End: Start/end game */

/* Begin: TIMER */
ipcMain.on("timerUpdated", (e, time) => {

})

/* End: TIMER */

setInterval(() => {
    var serverStatus = {
        webSocketServer: webSocketServer.getRunningStatus(),
        webServer: serverSocket != null ? "Running" : "Stopped",
        leagueClient: api.getConnectionStatus()
    }

    winConf.webContents.send("serverStatus", serverStatus)
}, 5000)

// iohook to send events to show/hide overlay
ioHook.on('keyup', (event) => {
    if (event.rawcode === 65)
        webSocketServer.sendToAllClients(JSON.stringify({ "event": "hideIngameOverlay", "data": {} }));
    if (event.rawcode === 79)
        webSocketServer.sendToAllClients(JSON.stringify({ "event": "showIngameOverlay", "data": {} }));
});

ioHook.start();