const EventEmitter = require('events') 
const peer = new EventEmitter()
const {ipcRenderer, desktopCapturer} = require('electron');
const { navigator, window, console } = require('globalthis/implementation');
const pc = new window.RTCPeerConnection({})
let dc = pc.createDataChannel('robotchannel', {reliable: false}); // 不需要它是必须可达的，允许一定的丢失
console.log('before-opened', dc)
dc.onopen = function() {
    console.log('opened')
    peer.on('robot', (type, data) => {
        dc.send(JSON.stringify({type, data}))
    })
}
dc.onmessage = function(event) {
    console.log('message', event)
}
dc.onerror = (e) => {console.log(e)}

async function getScreenStream() {
    const sources = await desktopCapturer.getSources({types: ['window', 'screen']})

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[0].id,
                maxWidth: window.screen.width,
                maxHeight: window.screen.height
            }
        }
    }, (stream) => {
        peer.emit('add-stream', stream)
    }, (err) => {
        // handle error
        console.log(err)
    })
}
getScreenStream()

async function createOffer() {
    let offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    })
    await pc.setLocalDescription(offer)
    console.log('create-offer\n', JSON.stringify(pc.localDescription))
    return pc.localDescription
}
createOffer().then((offer) => {
    console.log('forward', 'offer', offer)
    ipcRenderer.send('forward', 'offer', {type: offer.type, sdp: offer.sdp})
})

ipcRenderer.on('answer', (e, answer) => {
    setRemote(answer)
})

ipcRenderer.on('candidate', (e, candidate) => {
    addIceCandidate(candidate)
})

async function setRemote(answer) {
    await pc.setRemoteDescription(answer)
    console.log('create-answer', pc)
}
window.setRemote = setRemote

pc.onicecandidate = (e) => {
	console.log('candidate', JSON.stringify(e.candidate))
    if(e.candidate) {
       ipcRenderer.send('forward', 'control-candidate', e.candidate)
	   // 告知其他人
    }
}
// 加入以下三行
ipcRenderer.on('candidate', (e, candidate) =>{
    addIceCandidate(candidate)
})
const candidates = []
async function addIceCandidate(candidate) {
    if(candidate) {
        candidates.push(candidate)
    }
    if(pc.remoteDescription && pc.remoteDescription.type) {
        for(let i = 0; i < candidates.length; i++) {
            await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
        }
        candidates = []
    }
}
// window.addIceCandidate = addIceCandidate  去掉这一行

pc.onaddstream = (e) => {
	console.log('addstream', e)
	peer.emit('add-stream', e.stream)

}


// 先把robot屏蔽
// peer.on('robot', (type, data) => {
//     console.log('robot', type, data)
//     if(type === 'mouse') {
//         data.screen = {
//             width: window.screen.width, 
//             height: window.screen.height
//         }
//     }
//     setTimeout(() => {
//     ipcRenderer.send('robot', type, data)
//     }, 2000)

// })
module.exports = peer
