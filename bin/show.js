const shell = require('shelljs');

function show(){
    shell.cd('./src/react');
    shell.exec('npm run dev');
}

module.exports = show;