let { readdirSync, existsSync, statSync, unlinkSync, rmdirSync } = require('fs')

function delFolderSync(path){
    if(existsSync(path)){
        let files = readdirSync(path);
        files.forEach(file => {
            let currentPath = path + '/' + file;
            if(statSync(currentPath).isDirectory()) delFolderSync(currentPath);
            else unlinkSync(currentPath);
        })
        rmdirSync(path);
    }
}

module.exports = delFolderSync;