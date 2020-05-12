let { readdirSync, unlinkSync } = require('fs');

module.exports = delOtherFile;

function delOtherFile(fileDirName, keyFileName){
    let delFiles = readdirSync(fileDirName).filter(file => file != keyFileName);
    delFiles.forEach(fileName => {
        unlinkSync(fileDirName + fileName);
    })
}