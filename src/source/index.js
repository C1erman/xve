let { readdir } = require('fs')

const md2json = require('./md2json')
const mergeJsonFiles = require('./mergeJsonFiles')
const delFolderSync = require('./delFolder')

let mdDirName = '../md/'
let jsonDirName = '../../public/json/'

//清空文件夹
delFolderSync(jsonDirName)
readdir(mdDirName, (err, fileNames) => {
    if(err) console.error(err);
    else{
        Promise.all(fileNames.map((fileName, index) => 
            md2json(mdDirName, fileName.substring(0, fileName.lastIndexOf('.')), '.md', jsonDirName)
        ))
        .then(() => {
            mergeJsonFiles(jsonDirName);
        })
        .catch(err => console.error(err))
    }
})