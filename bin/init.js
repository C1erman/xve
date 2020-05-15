const shell = require('shelljs');

function init(){
    shell.cp('-R', __dirname + '/../src', './');
    shell.cp('-R', __dirname + '/../public', './');
    shell.echo('文件复制完成，开始下载npm包');
    shell.cd('./src/react');
    if(shell.exec('npm install').code !== 0){
        shell.echo('Error: npm install failed');
        shell.exit(1);
    }
}

module.exports = init;