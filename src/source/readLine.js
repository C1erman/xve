let { createReadStream } = require('fs');
let { createInterface } = require('readline');
//按行读取文件并将其返回为 promise 对象
//resolve 时返回内容数组
function readLine(fileName, fileType){
    return new Promise((resolve, reject) => {
        try {
            let readline = createInterface({
                input : createReadStream(fileName + fileType),
                crlfDelay : Infinity
            });
            let lines = [];
            readline.on('line', line => {
                lines.push(line);
            })
            readline.on('close', () => {
                resolve(lines);
            })
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

module.exports = readLine;