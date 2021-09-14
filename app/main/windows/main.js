const {BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let win
// 应用退出的时候会把窗口关闭，变量willQuitApp来控制
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
   
    // 在关闭之前，这个事件会被调用
    win.on('close', (e) => {
        // 应用退出的时候会把窗口关闭，就不会阻塞
        if (willQuitApp) {
            win = null; // 释放掉
        } else {
            // 禁止这个窗口的关闭，假关闭
            e.preventDefault();
            // 隐藏窗口
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

// 这样应用才能真的关掉
function close() {
    willQuitApp = true
    win.close()
}

module.exports = {create, send, show, close}