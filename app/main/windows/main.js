const {BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let win
let willQuitApp = false
function create () {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        show: false,
    })

    // Open the DevTools.
    //win.webContents.openDevTools();
   

    win.on('close', (e) => {
        if (willQuitApp) {
            win = null;
        } else {
            e.preventDefault();
            win.hide();
        }
    })

    win.on('ready-to-show', () => {
        win.show()
    })

    if (isDev) {
        win.loadURL('http://localhost:3000')
    } else {
        // 第三章用到
        win.loadFile(path.resolve(__dirname, '../../renderer/pages/main/index.html'))
    }

}

function send(channel, ...args) {
    win.webContents.send(channel, ...args)
}
function show() {
    if (win.isMinimized()) win.restore()
    win.show()
}

function close() {
    willQuitApp = true
    win.close()
}

module.exports = {create, send, show, close}