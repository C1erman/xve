let { readdir } = require('fs')

const md2json = require('./md2json')
const mergeJsonFiles = require('./mergeJsonFiles')
const delFolderSync = require('./delFolder')
const delOtherFile = require('./delOtherFile');

let mdDirName = '../md/'
let jsonDirName = '../../public/json/'
let sourceFileName = 'source.json'

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
            //删除多余 JSON 文件
            delOtherFile(jsonDirName, sourceFileName)
        })
        .catch(err => console.error(err))
    }
})

// delFolderSync(mdDirName)
// readdir(mdDirName, (err, fileNames) => {
//     if(err) console.error(err);
//     else{
//         Promise.all(fileNames.map((fileName, index) => 
//             m2j(mdDirName, fileName, jsonDirName)
//         ))
//         .then(() => {
//             // mergeJsonFiles(jsonDirName);
//         })
//         .catch(err => console.error(err))
//     }
// })