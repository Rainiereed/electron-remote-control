const openAboutWindow = require('about-window').default;
const path = require('path')
const create = () => openAboutWindow({
    icon_path: path.join(__dirname, 'icon.png'),
    package_json_dir: path.resolve(__dirname  + '/../../../'),
    homepage: 'https://github.com/Rainiereed/electron-remote-control',
    bug_report_url: 'https://github.com/Rainiereed/electron-remote-control/issues',
})
module.exports = {create}