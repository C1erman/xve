const shell = require('shelljs');
const {readFileSync, existsSync} = require('fs');

function push(){
    const {deploy} = JSON.parse(readFileSync('./src/react/src/config.json'));
    shell.cd('./public');
    shell.exec('git add .');
    shell.exec('git commit -m "auto commit by xve"');
    shell.exec('git push ' + deploy.repo);
}

module.exports = push;