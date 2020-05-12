let { readdirSync, appendFileSync, readFileSync } = require('fs');

module.exports = mergeJsonFiles;

function mergeJsonFiles(jsonFileDirName){
    let jsonFiles = readdirSync(jsonFileDirName);
    let sourceJsonFileName = jsonFileDirName + 'source.json';
    appendFileSync(sourceJsonFileName, '[');
    jsonFiles.forEach((fileName, index, array) => {
        let fileSourcePath = jsonFileDirName + '/' + fileName;
        appendFileSync(sourceJsonFileName, readFileSync(fileSourcePath));
        if(index === array.length -1){
            appendFileSync(sourceJsonFileName, ']');
        }else{
            appendFileSync(sourceJsonFileName, ',');
        }
    })
}