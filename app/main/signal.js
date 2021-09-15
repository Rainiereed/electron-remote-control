const WebSocket = require('ws');
const EventEmitter = require('events');
const signal = new EventEmitter();

const ws = new WebSocket('ws://127.0.0.1:8080'); // 这里面写自己的服务器。Johan电脑IP 192.168.10.174  My own Mac IP: 192.168.10.221
ws.on('open', function open() {
    console.log('connect success')
})

ws.on('message', function incoming(message) {
    let data = JSON.parse(message)
    console.log('data', data, message);
    signal.emit(data.event, data.data)
})


function send(event, data) {
    console.log('sended', JSON.stringify({event, data}))
    ws.send(JSON.stringify({event, data}))
}

function invoke(event, data, answerEvent) {
    return new Promise((resolve, reject) => {
        send(event, data)
        signal.once(answerEvent, resolve)
        setTimeout(() => {
            reject('timeout')
        }, 5000)
    })
}
signal.send = send
signal.invoke = invoke

module.exports = signal