const {app, BrowserWindow} = require('electron') 
const path = require('path')
const isDev = require('electron-is-dev')
const handleIPC = require('./ipc')
const {create: createMainWindow, show: showMainWindow, close: closeMainWindow} = require('./windows/main')
// const {create: createControlWindow} = require('./windows/control')
if(require('electron-squirrel-startup')) app.quit()
// 禁止应用多开
// 获取现在是不是有别的进程了,应用是否存在了实例
const gotTheLock = app.requestSingleInstanceLock()
// 有的话直接退出
if (!gotTheLock) {
    app.quit()
} else { // 否则的话才进行到正常启动的逻辑
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // 当运行第二个实例时,将会聚焦到myWindow这个窗口
        showMainWindow()
    })
    app.on('will-finish-launching', () => {
        if(!isDev) {
            require('./updater.js')
        }
        require('./crash-reporter').init()
    })
    // 创建 myWindow, 加载应用的其余部分, etc...
    app.on('ready', () => {
        //createControlWindow()
        // 报错先注释掉 app.fp = require('geektime-fringerprint-example').getFringerprint()
        app.fp = require('geektime-fringerprint-example').getFringerprint()
        createMainWindow()
        handleIPC()
        require('./trayAndMenu')
        require('./robot.js')() // don't forget () to invoke it
    })

    app.on('activate', () => {
        // process.crash()
        showMainWindow()
    })
   
    app.on('before-quit', () => {
        closeMainWindow()
    })
}