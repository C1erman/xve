const shell = require('shelljs');

function init(){
    shell.cd('./src/react');
    if(shell.exec('npm install').code !== 0){
        shell.echo('Error: npm install failed');
        shell.exit(1);
    }
}

module.exports = init;