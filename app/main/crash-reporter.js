const {crashReporter} = require('electron')

function init() {
    crashReporter.start({
        productName: 'Reed Control',
        submitURL: 'http://127.0.0.1:33855/crash',

    })
}
module.exports = {init}