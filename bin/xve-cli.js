#!/usr/bin/env node
const program = require('commander');

program
    .command('init')
    .alias('i')
    .description('init your whole project.')
    .action(() => {
        require('./init')();
    });
program
    .command('new <fileName>')
    .description('create a new markdown file for post.')
    .action((fileName, cmd) => {
        require('./newPost')(fileName);
    });
program
    .command('gen')
    .alias('g')
    .description('generate the react-base SPA.')
    .action(() => {
        require('./generate')();
    });
program
    .command('show')
    .alias('s')
    .description('show your react-base SPA.')
    .action(() => {
        require('./show')();
    })
program
    .command('push')
    .alias('p')
    .description('push your SPA to github.')
    .action(() => {
        require('./push')();
    })

program.parse(process.argv);