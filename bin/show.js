const shell = require('shelljs');

function show(){
    shell.cd('./src/source');
    shell.exec('node index.js');
    shell.cp('-R', '../../public/json', '../react/src/')
    shell.cd('../react');
    shell.exec('npm run dev');  
}

module.exports = show;