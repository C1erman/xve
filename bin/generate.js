const shell = require('shelljs');

function gen(){
    shell.cd('./src/react');
    shell.exec('npm run build');
    shell.cd('../source');
    shell.exec('node index.js')
}

module.exports = gen;