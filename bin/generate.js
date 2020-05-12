const shell = require('shelljs');

function gen(){
    shell.cd('./src/source');
    shell.exec('node index.js')
    shell.cd('../react');
    shell.exec('npm run build');
}

module.exports = gen;