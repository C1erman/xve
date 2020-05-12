const shell = require('shelljs');

function push(){
    shell.cd('./public');
    shell.exec('git add .');
    shell.exec('git commit -m "auto commit by xve"');
    shell.exec('git push');
}

module.exports = push;