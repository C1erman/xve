const { existsSync, writeFileSync } = require('fs');
const shell = require('shelljs');

function getDefaultMarkdown(fileName){
    let date = new Date();
    return [
        '---',
        'title: ' + fileName,
        `date: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        '---',
        '',
        '<!--more-->',
        ''
    ]
}
function newPost(fileName){
    shell.cd('./src/md');
    let mdFileName = fileName + '.md';
    if(existsSync(mdFileName)){
        shell.echo('This post has already exist.');
        shell.exit(2);
    }
    else{
        writeFileSync(mdFileName, getDefaultMarkdown(fileName).join('\r\n'), (err) => {
            shell.echo(err);
        })
    }
}

module.exports = newPost;