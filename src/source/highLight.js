//实现代码高亮

module.exports = highLightLine;

const keywords = {
    java : ['class','abstract','assert','boolean','break','byte','case','catch','char',
            'const','continue','default','do','double','else','enum','extends','final','finally',
            'float','for','goto','if','implements','import','instanceof','int','interface','long','native',
            'new','package','private','protected','public','return','short','static','strictfp','super',
            'switch','synchronized','this','throw','throws','transient','try','void','volatile','while','true','false','null'],
    javascript : ["class","abstract","arguments","boolean","break","byte","case","catch","char","const","continue","debugger","default",
            "delete","do","double","else","eval","false","final","finally","float","for","function","goto","if","implements",
            "in","instanceof","int","interface","let","long","native","new","null","package","private","protected","public",
            "return","short","static","switch","synchronized","this","throw","throws","transient","true","try","typeof",
            "var","void","while","with","yield","enum","export","extends","import","super"],
    python : ['class','and','assert','in','del','else','raise','from','if','continue','not','pass','finally',
            'while','yield','is','as','break','return','elif','except','def','global','import','for','or',
            'print','lambda','with','try','exec'],
    'c++' : ['class','asm','else','new','this','auto','enum','operator','throw','bool','explicit','private','true',
        'break','export','protected','try','case','extern','public','typedef','catch','false','register','typeid','char','float',
        'reinterpret_cast','typename','for','return','union','const','friend','short','unsigned','const_cast','goto','signed','using','continue',
        'if','sizeof','virtual','default','inline','static','void','delete',
        'int','static_cast','volatile','do','long','struct','wchar_t','double','mutable','switch','while','dynamic_cast','namespace','template']
}
const objects = {
    'javascript' : ['Number', 'String', 'Boolean', 'Symbol', 'undefined', 'none', 'null',
            'Object', 'NaN', 'Function', 'Array', 'Map', 'Set', 'Date', 'RegExp', 'document', 'Document', 'body']
}
const usual = ['[]', '()', '{}', "'", '"']
function highLightLine(line, langType){
    let keyword = keywords[langType] || keywords.javascript;
        object = objects[langType] || objects.javascript;
    keyword.forEach(key => {
        line = line.replace(new RegExp(key +'\\b'), `<span class='hl-keyword'>${key}</span>`);
    })
    object.forEach(key => {
        line = line.replace(new RegExp(key +'\\b'), `<span class='hl-object'>${key}</span>`);
    })
    // usual.forEach(key => {
    //     line = line.replace(new RegExp(key +'\\b'), `<span class='hl-usual'>${key}</span>`);
    // })
    return line;
}
//即求 next 数组
function calculateMaxMatchLengths(pattern){
    let maxMatchLengths = Array(pattern.length).fill(0);
    let maxLength = 0;
    for(let i = 1; i < pattern.length; i++){
        while(maxLength > 0 && pattern[maxLength] != pattern[i]) maxLength = maxMatchLengths[maxLength - 1];
        if(pattern[maxLength] === pattern[i]) maxLength++;
        maxMatchLengths[i] = maxLength;
    }
    return maxMatchLengths;
}

function KMP(string, pattern){
    let position = [];
    let maxMatchLengths = calculateMaxMatchLengths(pattern);
    let count = 0;
    for(let i = 0; i < string.length; i++){
        while(count > 0 && pattern[count] != string[i]) count = maxMatchLengths[count - 1];
        if(parent[count] === string[i]) count++;
        if(count === pattern.length){
            position.push(i - pattern.length + 1);
            count = maxMatchLengths[count - 1];
        }
    }
    return position;
}