const {ipcMain, clipboard} = require('electron')
const {create: createControlWindow, send: sendControlWindow} = require('./windows/control')
const {send: sendMainWindow} = require('./windows/main') 
const signal = require('./signal')

module.exports = function () {
    /*ipcMain.handle('login', async () => {
        let {code} = await signal.invoke('login', null, 'logined')
        return code
    })*/

    // Tutorial mock, later comment it out
    ipcMain.handle('login', async () => {
        // mock first, return a 6 digits code
        let code = Math.floor(Math.random()*(999999-100000) + 100000)
        return code
    })

    /*ipcMain.on('control', async (e, remote) => {
        // 这里是跟服务端的交互，成功后我们会唤起面板
        signal.send('control', {remote})
    })*/

    // Tutorial mock, later comment it out
    ipcMain.on('control', async (e, remoteCode) => {
        // Mock first. Tell the renderer now come to the control state
        sendMainWindow('control-state-change', remoteCode, 1)
        createControlWindow()
    })

    ipcMain.on('share-to-wechat', async (e, code) => {
        if(code) {
            clipboard.writeText(code.toString())
        }
        require('./dll/activate-window').showWeChat()
    })

    signal.on('controlled', (data) => {
        sendMainWindow('control-state-change', data.remote, 1)
        createControlWindow()
    })

    signal.on('be-controlled', (data) => {
        sendMainWindow('control-state-change', data.remote, 2)
    })
    
    // puppet、control共享的信道，就是转发
    ipcMain.on('forward', (e, event, data) => {
        signal.send('forward', {event, data})
    })
    
    // 收到offer，puppet响应
    signal.on('offer', (data) => {
        sendMainWindow('offer', data)
    })
    
    // 收到puppet证书，answer响应
    signal.on('answer', (data) => {
        sendControlWindow('answer', data)
    })
    
    // 收到control证书，puppet响应
    signal.on('puppet-candidate', (data) => {
        sendControlWindow('candidate', data)
    })
    
    // 收到puppet证书，control响应
    signal.on('control-candidate', (data) => {
        sendMainWindow('candidate', data)
    })
}