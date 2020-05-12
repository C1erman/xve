//该工具函数的作用是将某一文件夹下的一个或多个 md 文件转换成 json 文件
//可通过对比每一篇文章对应的 obj 结构的 lastModified 属性，对比从旧 json 文件提取出来的相同属性
//确定该篇文章是否被修改过，从而判断是否复写
//最主要的担心就是 json 文件过大的问题，也没有必要特意转换成单一 json 文件
//现将合并 json 文件的功能抽取为 mergeJsonFiles.js
//同步任务可能比较消耗时间

let { readFileSync, statSync, existsSync, mkdirSync, writeFileSync } = require('fs')
let readLine = require('./readLine');
let highLightLine = require('./highLight');

module.exports = md2json;

function md2json(mdDirName, mdFileName, fileType = '.md', jsonDirName){
    return new Promise((resovle, reject) => {
        readLine(mdDirName + mdFileName, fileType).then(mdLines => {
            resovle(
                toJsonFile(
                    scanLineType(
                        scanArea(mdLines)
                        ), mdFileName, jsonDirName, mdDirName)
                    );
        }).catch(error => {
            reject(error);
            console.log(error);
        });
    })
}
//第一次 scan 确定 代码区 引用区 有序列表区 无序列表区 注释区 表格区
//这些区域需要联系上下行进行判断
//分成两次扫描的原因是因为 代码区 注释区 内不含其他格式
function scanArea (mdLines) {
    mdLines = mdLines.filter(line => line.length);  //处理 typora 行间空行

    let areaTypes = [];
    let scanedLines = [];
    let codeBegin = false, codeEnd = false,
        commentBegin = false, commentEnd = false;

    areaTypes.push('other')
    scanedLines.push('')
    //函数的第一次 scan
    for(let i = 0; i < mdLines.length; i++){
        let singleLine = mdLines[i];
        //大于 2 的原因是 \r\n 已经处理掉了
        if(singleLine.length > 2 && singleLine[0] == '`'
        && singleLine[1] == '`' && singleLine[2] == '`'){
            if(!codeBegin && !codeEnd){
                //进入代码区
                areaTypes.push('code_start')
                scanedLines.push('')
                codeBegin = true;
            }
            else if(codeBegin && !codeEnd){
                //离开代码区
                areaTypes.push('code_end')
                scanedLines.push('')
                codeBegin = false;
                codeEnd = false;
            }
            else{
                //代码区中间
                areaTypes.push('other')
                scanedLines.push(singleLine)
            }
        }
        else if(singleLine.length > 2 && singleLine[0] == '-'
        && singleLine[1] == '-' && singleLine[2] == '-'){
            if(!commentBegin && !commentEnd){
                //进入注释区
                areaTypes.push('com_start')
                scanedLines.push('')
                commentBegin = true;
            }
            else if(commentBegin && !commentEnd){
                //离开注释区
                areaTypes.push('com_end')
                scanedLines.push('')
                commentBegin = false;
                commentEnd = false;
            }
            else{
                //注释区中间
                areaTypes.push('other')
                scanedLines.push(singleLine)
            }
        }
        else{
            areaTypes.push('other')
            scanedLines.push(singleLine)
        }
    }
    //本函数的第二次 scan
    let isCodeArea = false, isCommentArea = false, isHtmlArea = false;
    areaTypes.push('other')
    scanedLines.push('')
    let lastAreaTypes = JSON.parse(JSON.stringify(areaTypes)),
        lastScanedLines = JSON.parse(JSON.stringify(scanedLines));
    areaTypes = [], scanedLines = [];

    areaTypes.push('other');
    scanedLines.push('');
    //列表相关
    let inCodeCtx = false;
    let inOlCtx = false, inUlCtx = false;
    let olRegexp = /^\d{1,2}$/;
    let ulRegexp = /^[*\-+]\s$/;
    // let listCtxRegexp = /^\s{2,}/;
    let listCtxRegexp = /^\s{2,3}(?!\s)/;
    let unSafeListCtxRegexp = /^\s{2,}/;
    let titleRegexp = /^(#+)\s/;
    //列表条件抽离
    const liCtx = (line) => listCtxRegexp.test(line) || listCtxRegexp.test(line.replace(/^\s{2,3}?/,''));
    const ol = (line) => {
        // line = line.trim();
        return line.length >= 2 && olRegexp.test(line.substring(0, line.indexOf('.')));
    }
    const ul = (line) => {
        // line = line.trim();
        return ulRegexp.test(line.substring(0, 2));
    }
    const olAndCtx = (line) => line.length >= 2 && 
        (olRegexp.test(line.substring(0, line.indexOf('.'))) 
        || listCtxRegexp.test(line) || listCtxRegexp.test(line.replace(/^\s{2,3}?/,'')));
    const ulAndCtx = (line) => line.length >=2 &&
        (ulRegexp.test(line.substring(0, 2))
        || listCtxRegexp.test(line) || listCtxRegexp.test(line.replace(/^\s{2}/,'')));
    const unSafeBorder = (line) => {
        firstLetter = line.trim()[0];
        return firstLetter == '|'
    }
    for(let i = 1; i < lastScanedLines.length - 1; i++){
        //防止超出范围，已在开头和结尾追加额外内容
        let singleLine = lastScanedLines[i],
            lastLine = lastScanedLines[i - 1],
            nextLine = lastScanedLines[i + 1];
        //危险的边界
        let NextLine = lastScanedLines[i + 2] || '';
        //table safer
        if(singleLine[0] == '|' && nextLine.trim()[0] == '|'){
            singleLine = nextLine.replace(nextLine.replace(/^\s+(?!\s)/,''),'') + singleLine;
        }
        //其它类型处理
        if(lastAreaTypes[i] == 'code_start'){
            isCodeArea = true;
            areaTypes.push('code_start');
            scanedLines.push(singleLine);
            continue;
        }
        if(lastAreaTypes[i] == 'code_end'){
            isCodeArea = false;
            areaTypes.push('code_end');
            scanedLines.push(singleLine);
            continue;
        }
        if(lastAreaTypes[i] == 'com_start'){
            isCommentArea = true;
            areaTypes.push('com_start');
            scanedLines.push(singleLine);
            continue;
        }
        if(lastAreaTypes[i] == 'com_end'){
            isCommentArea = false;
            areaTypes.push('com_end');
            scanedLines.push(singleLine);
            continue;
        }
        //本次 scan 的行不在 code area 与 comment area中
        if(!isCodeArea && !isCommentArea){
            //由于会出现列表上下文中的代码区
            if(/```/.test(singleLine)) inCodeCtx = !inCodeCtx;
            //判断是否为引用区
            if(singleLine.length >= 1 && singleLine[0] == '>'
            && lastLine[0] != '>' && nextLine[0] == '>'){
                areaTypes.push('quote_start', 'other');
                scanedLines.push('', singleLine);
            }
            else if(singleLine.length >= 1 && singleLine[0] == '>'
            && lastLine[0] == '>' && nextLine[0] != '>'){
                areaTypes.push('other', 'quote_end');
                scanedLines.push(singleLine, '');
            }
            else if(singleLine.length >= 1 && singleLine[0] == '>'
            && lastLine[0] != '>' && nextLine[0] != '>'){
                areaTypes.push('quote_start', 'other', 'quote_end');
                scanedLines.push('', singleLine, '');
            }       
            //判断是否为有序列表区
            else if((ol(singleLine) && !ol(lastLine) && !olAndCtx(nextLine))
            || (ol(singleLine) && !ol(lastLine) && ol(nextLine) && liCtx(NextLine))){
                areaTypes.push('ol_start', 'other', 'ol_end');
                scanedLines.push('', singleLine, '');
            }
            else if((ol(singleLine) && !ol(lastLine) && olAndCtx(nextLine))
            ||(ol(lastLine) && ol(singleLine) && liCtx(nextLine))){
                inOlCtx = true;
                areaTypes.push('ol_start', 'other');
                scanedLines.push('', singleLine);
            }
            else if(((olAndCtx(lastLine) && liCtx(singleLine) && (ol(nextLine) || ul(nextLine)))
            ||(olAndCtx(singleLine) && !olAndCtx(nextLine))
            ||(ol(lastLine) && ul(singleLine) && !liCtx(nextLine))
            ||(ol(singleLine) && ol(nextLine) && liCtx(NextLine)))
            && !unSafeBorder(singleLine)
            && !inUlCtx
            && !inCodeCtx){
                inOlCtx = false;
                areaTypes.push('other', 'ol_end');
                scanedLines.push(singleLine, '');
            }
            //判断是否为无序列表区
            else if((ul(singleLine) && !ul(lastLine) && !ulAndCtx(nextLine))
            || (ul(singleLine) && !ul(lastLine) && ul(nextLine) && liCtx(NextLine))){
                areaTypes.push('ul_start', 'other', 'ul_end');
                scanedLines.push('', singleLine, '');
            }
            else if((ul(singleLine) && !ul(lastLine) && ulAndCtx(nextLine))
            ||(ul(lastLine) && ul(singleLine) && liCtx(nextLine))){
                inUlCtx = true;
                areaTypes.push('ul_start', 'other');
                scanedLines.push('', singleLine);
            }
            else if(((ulAndCtx(lastLine) && liCtx(singleLine) && (ol(nextLine) || ul(nextLine)))
            ||(ulAndCtx(singleLine) && !ulAndCtx(nextLine))
            ||(ul(lastLine) && ol(singleLine) && !liCtx(nextLine))
            ||(ul(singleLine) && ul(nextLine) && liCtx(NextLine)))
            && !unSafeBorder(singleLine)
            && !inOlCtx
            && !inCodeCtx){
                inUlCtx = false;
                areaTypes.push('other', 'ul_end');
                scanedLines.push(singleLine, '');
            }
            //判断是否为表格区
            else if((singleLine.length >= 3
            && singleLine[0] == '|' && singleLine[singleLine.length - 1] == '|')
            && !(lastLine.length >= 3
            && lastLine[0] == '|' && lastLine[lastLine.length - 1] == '|')
            && (nextLine.length >=3
            && nextLine[0] == '|' && nextLine[nextLine.length -1] == '|')){
                areaTypes.push('table_start', 'other');
                scanedLines.push('', singleLine);
            }
            else if((singleLine.length >= 3
            && singleLine[0] == '|' && singleLine[singleLine.length - 1] == '|')
            && (lastLine.length >= 3
            && lastLine[0] == '|' && lastLine[lastLine.length - 1] == '|')
            && !(nextLine.length >=3
            && nextLine[0] == '|' && nextLine[nextLine.length -1] == '|')){
                areaTypes.push('other', 'table_end');
                scanedLines.push(singleLine, '');
            }
            //其它
            else {
                areaTypes.push('other');
                scanedLines.push(singleLine);
            }
        }
        //代码区与注释区的默认每行类型
        else {
            areaTypes.push('other');
            scanedLines.push(singleLine);
        }
    }
    areaTypes.push('other');
    scanedLines.push('');
    
    return {
        areaTypes,
        scanedLines
    };
}
//第二次 scan 确定每行行属性 引用行 有序列表行 无序列表行 代码行 空白行 标题行 注释行 表格行
function scanLineType (md){
    let {areaTypes, scanedLines} = md;
    let type = [];  //use this like a stack
    let tables = [];  //save and import the info of table area
    let quotes = [];  //save and import the info of quote area
    let lists = [];  //save and import the info of list area
    //列表相关
    let olRegexp = /^\d{1,2}$/;
    let ulRegexp = /^[*\-+]\s$/;
    let listCtxRegexp = /^\s{2,3}/;
    let olCtxRegexp = /^\s{3}/;
    let ulCtxRegexp = /^\s{2}/;
    //列表条件抽离
    const liCtx = (line) => listCtxRegexp.test(line);
    const ol = (line) => {
        // line = line.trim();
        return line.length >= 2 && olRegexp.test(line.substring(0, line.indexOf('.')));
    }
    const ul = (line) => {
        // line = line.trim();
        return ulRegexp.test(line.substring(0, 2));
    }
    for(let i = 0; i < scanedLines.length; i++){  
        let singleLine = scanedLines[i],
            singleLineType = areaTypes[i];
        if(singleLineType == 'code_start' || singleLineType == 'quote_start'
        || singleLineType == 'ol_start' || singleLineType == 'ul_start' || singleLineType == 'com_start'
        || singleLineType == 'table_start'){
            type.push(singleLineType);
            if(singleLineType == 'ol_start') scanedLines[i] = `ol_start_at :${scanedLines[i + 1].substring(0, scanedLines[i + 1].indexOf('.')).trim()}`;
            else if(singleLineType == 'code_start') scanedLines[i] = '```';
        }
        else if(singleLineType == 'code_end' || singleLineType == 'quote_end'
        || singleLineType == 'ol_end' || singleLineType == 'ul_end' || singleLineType == 'com_end'
        || singleLineType == 'table_end'){
            type.pop(); // remove the last ele in the array
            if(singleLineType == 'table_end') tables[tables.length - 1].endIndex = i;
            else if(singleLineType == 'quote_end') quotes[quotes.length - 1].endIndex = i;
            //暂时考虑无序列表区
            else if(singleLineType == 'ul_end' || singleLineType == 'ol_end') lists[lists.length - 1].endIndex = i;
            else if(singleLineType == 'code_end') scanedLines[i] = '```';
        }
        else if(singleLineType == 'other'){
            if(type.length){
                let typeOfThisLine = type[type.length -1];
                if(typeOfThisLine == 'quote_start'){
                    // scanedLines[i] = singleLine.trim().substring(1).trim();   
                    scanedLines[i] = singleLine.substring(1).replace(/^\s/, '');
                    if(!quotes.length) quotes.push({
                        startIndex : undefined,
                        endIndex : undefined
                    });
                    else if(quotes[quotes.length - 1].endIndex){
                        //新引用区
                        quotes = [...quotes, {
                            startIndex : undefined,
                            endIndex : undefined
                        }];
                    }
                    let currentQuote = quotes[quotes.length - 1];
                    if(!currentQuote.startIndex){
                        currentQuote.startIndex = i;
                    }
                }
                else if(typeOfThisLine == 'ol_start'){
                    // scanedLines[i] = singleLine;
                    if(!lists.length) lists.push({
                        startIndex : undefined,
                        endIndex : undefined
                    });
                    else if(lists[lists.length - 1].endIndex){
                        //新无序列表区
                        lists = [...lists, {
                            startIndex : undefined,
                            endIndex : undefined
                        }];
                    }
                    let currentList = lists[lists.length - 1]
                    if(!currentList.startIndex){
                        currentList.startIndex = i;
                    }
                    //只过滤首行
                    scanedLines[i] = /^\d{1,2}\./.test(singleLine) ? singleLine.substring(singleLine.indexOf('.') + 1).trim() : singleLine.replace(olCtxRegexp, '');
                    areaTypes[i] = /^\d{1,2}\./.test(singleLine) ? 'ol_line' : 'other';
                }
                else if(typeOfThisLine == 'ul_start'){
                    if(!lists.length) lists.push({
                        startIndex : undefined,
                        endIndex : undefined
                    });
                    else if(lists[lists.length - 1].endIndex){
                        //新无序列表区
                        lists = [...lists, {
                            startIndex : undefined,
                            endIndex : undefined
                        }];
                    }
                    let currentList = lists[lists.length - 1]
                    if(!currentList.startIndex){
                        currentList.startIndex = i;
                    }
                    //只过滤首行，考虑嵌套的问题
                    scanedLines[i] = ul(singleLine) ? singleLine.replace(/^[\*\-+]\s/, '').trim() : singleLine.replace(ulCtxRegexp, '');
                    areaTypes[i] = ul(singleLine) ? 'ul_line' : 'other';
                    
                }
                else if(typeOfThisLine == 'com_start'){
                    scanedLines[i] = singleLine.trim();
                    areaTypes[i] = 'com_line';
                }
                else if(typeOfThisLine == 'table_start'){
                    if(!tables.length) tables.push({
                        startIndex : undefined,
                        endIndex : undefined,
                        align : false
                    });
                    else if(tables[tables.length - 1].endIndex){
                        //新表格区
                        tables = [...tables, {
                            startIndex : undefined,
                            endIndex : undefined,
                            align : false
                        }];
                    }
                    let currentTable = tables[tables.length - 1];                 
                    if(!currentTable.endIndex){
                        //当前表格区尚未结束
                        if(!currentTable.startIndex){
                            currentTable.startIndex = i;
                            areaTypes[i] = 'table_title';
                        }
                        else if(!currentTable.align){
                            currentTable.align = true;
                            areaTypes[i] = 'table_align';
                        }
                        else{
                            areaTypes[i] = 'table_line';
                        }
                    }
                    scanedLines[i] = singleLine;
                }
                else{
                    areaTypes[i] = 'code_line'
                }
            }
            //空白行
            if(singleLine.trim() == ''){
                scanedLines[i] = '';
                areaTypes[i] = 'blank_line';
            }
            //<!--more-->
            if(singleLine.trim() == '<!--more-->'){
                scanedLines[i] = '';
                areaTypes[i] = 'more_line';
            }
            //标题行
            //保留 # 号以确定标题级别
            else if(/^#+\s/.test(singleLine)){
                scanedLines[i] = singleLine.trim();
                areaTypes[i] = 'title'   
            }
        }
    }
    //处理引用区
    while(quotes.length){
        let { startIndex, endIndex } = quotes.pop();
        let range = endIndex - startIndex;
        // console.log('这是处理引用区的内容')
        let result = scanLineType(scanArea(scanedLines.slice(startIndex, endIndex)));
        let hani = result.areaTypes.length - range;
        areaTypes.splice(startIndex, range, ...result.areaTypes);
        scanedLines.splice(startIndex, range, ...result.scanedLines);
        //重新设置表格下标
        result.tables.forEach(table => {
            table.startIndex += startIndex;
            table.endIndex += startIndex;
        });
        tables.forEach(table => {
            let tableStartIndex = table.startIndex,
                tableEndIndex = table.endIndex;
            if(tableEndIndex < startIndex){}
            else if(tableStartIndex > endIndex){
                table.startIndex += hani;
                table.endIndex += hani;
            }
        });
        tables = [...tables, ...result.tables];
        //重新设置列表下标
        lists.forEach(list => {
            let listStartIndex = list.startIndex,
                listEndIndex = list.endIndex;
            if(listEndIndex < startIndex){}
            else if(listStartIndex > endIndex){
                list.startIndex += hani;
                list.endIndex += hani;
            }
        })
    }
    //处理列表区
    while(lists.length){
        let { startIndex, endIndex } = lists.pop();
        let range = endIndex - startIndex;
        //判断是否有连续的 ul_line 或 ol_line
        let inHani = {
            areaTypes : areaTypes.slice(startIndex, endIndex)
        }
        let continuousListLine = hasContinuousListLine(inHani);
        //针对范围内的列表行进行判断
        //什么时候会出现多个 continuousListLine --> 没有拆分整个 areaTypes 的时候
        //所以现在对区域进行了拆分 理论上不会出现多个 continuousListLine
        if(continuousListLine.length && ((continuousListLine[0][1] - continuousListLine[0][0] + 1) == range)){
            //有连续 ul_line 或 ol_line
            continuousListLine.forEach(v => {
                let lineStartIndex = v[0], lineEndIndex = v[1];
                let oldType = areaTypes.slice(lineStartIndex + startIndex, lineEndIndex + startIndex + 1);
                //并不改变数组长度
                areaTypes.splice(lineStartIndex + startIndex, lineEndIndex - lineStartIndex + 1, ...oldType.map(v => v.replace('line', 'lines')));
            })
        }
        else{
            let result = scanLineType(scanArea(scanedLines.slice(startIndex, endIndex)));
            //加二是因为要在每次替换时留一个 list 钩子
            let hani = result.areaTypes.length - range + 2;

            result.areaTypes.unshift('li_hook_start');
            result.scanedLines.unshift('');
            result.areaTypes.push('li_hook_end');
            result.scanedLines.push('');
            
            let old = {areaTypes, scanedLines};
            result.areaTypes = comListLines(old, result);

            areaTypes.splice(startIndex, range, ...result.areaTypes);
            scanedLines.splice(startIndex, range, ...result.scanedLines);

            //重新设置表格下标
            result.tables.forEach(table => {
                table.startIndex += startIndex;
                table.endIndex += startIndex;
            });
            tables.forEach(table => {
                let tableStartIndex = table.startIndex,
                    tableEndIndex = table.endIndex;
                if(tableEndIndex < startIndex){}
                else if(tableStartIndex > endIndex){
                    table.startIndex += hani;
                    table.endIndex += hani;
                }
            });
            tables = [...tables, ...result.tables];
        }    
    }

    return {
        areaTypes,
        scanedLines,
        tables
    };
}
//第三次 scan 将每行 markdown 转成 html 并将其存为 json file
function toJsonFile(md, mdFileName, jsonDirName, mdDirName){
    let {areaTypes, scanedLines, tables} = md;

    let comment = {};  //注释对象
    let summary = {};  //总结对象
    let anchors = [];
    for(let i = 0; i < scanedLines.length; i++){
        let singleLine = scanedLines[i],
            singleLineType = areaTypes[i];
        //普通文本行
        if(singleLineType == 'other'){
            let htmlLine = parseLines(singleLine);
            scanedLines[i] = htmlLine.trim() == '' ? '' : `<p>${htmlLine}</p>`;
        }
        //<!--more-->
        if(singleLineType == 'more_line'){
            summary.slicePoint = i;
        }
        //注释区
        else if(singleLineType == 'com_start' || singleLineType == 'com_end') continue;
        else if(singleLineType == 'com_line'){
            let comRegexp = /^([^:]+):(.*)/;
            let res = comRegexp.exec(singleLine);
            comment[res[1]] = res[2].trim();
            scanedLines[i] = '';
        }
        //代码区
        else if(singleLineType == 'code_start') scanedLines[i] = `<pre>`
        else if(singleLineType == 'code_line') scanedLines[i] = `<code>${escapeCodeLines(singleLine)}</code>`
        else if(singleLineType == 'code_end') scanedLines[i] =`</pre>`
        //引用区
        else if(singleLineType == 'quote_start') scanedLines[i] = `<blockquote>`
        else if(singleLineType == 'quote_end') scanedLines[i] =`</blockquote>`
        //标题行
        else if(singleLineType == 'title'){
            let titleRegexp = /^(#+)\s/;
            let titleLevel = (() => {
                let level = titleRegexp.exec(singleLine)[0].length - 1;
                if(level >= 6) return 6;
                else return level;
            })();
            let titletext = parseLines(singleLine);
            let titleId = singleLine.replace(titleRegexp, '') + '-' + anchors.filter(anchor => anchor.text === titletext).length;
            scanedLines[i] = `<h${titleLevel} id='${titleId}'>${titletext}</h${titleLevel}>`;
            anchors.push({
                id : titleId,
                level : titleLevel,
                text : titletext
            });
        }
        //有序列表行
        else if(singleLineType == 'ol_start'){
            scanedLines[i] = `<ol start='${singleLine.slice(singleLine.indexOf(":") + 1)}'>`
        }
        else if(singleLineType == 'ol_line'){
            scanedLines[i] = `<p>${parseLines(singleLine)}</p>`
        }
        else if(singleLineType == 'ol_end'){
            scanedLines[i] = `</ol>`
        }
        //无序列表行
        else if(singleLineType == 'ul_start'){
            scanedLines[i] = `<ul>`
        }
        else if(singleLineType == 'ul_line'){
            scanedLines[i] = `<p>${parseLines(singleLine)}</p>`
        }
        else if(singleLineType == 'ul_end'){
            scanedLines[i] = `</ul>`
        }
        //列表钩子
        else if(singleLineType == 'li_hook_start'){
            scanedLines[i] = `<li>`;
        }
        else if(singleLineType == 'li_hook_end'){
            scanedLines[i] = '</li>'
        }
        else if(singleLineType == 'ul_lines' || singleLineType == 'ol_lines'){
            scanedLines[i] = `<li>${parseLines(singleLine)}</li>`
        }
        //表格行
        else if(singleLineType == 'table_start'){
            scanedLines[i] = `<table>`
        }
        else if(singleLineType == 'table_title'){
            scanedLines[i] = parseTableLines(singleLine, singleLineType)
        }
        else if(singleLineType == 'table_align'){
            let currentTable = tables.filter(table => i > table.startIndex && i < table.endIndex)[0];
            currentTable.align = parseTableLines(singleLine, singleLineType);
            scanedLines[i] = '<tbody>'
        }
        else if(singleLineType == 'table_line'){
            scanedLines[i] = `${parseTableLines(singleLine, singleLineType)}`
        }
        else if(singleLineType == 'table_end'){
            scanedLines[i] = '</tbody></table>'
        }
    }
    //表格区对齐处理
    while(tables.length){
        let alignRegexp = /align(?!=)/;
        let currentTable = tables.pop();
        let currentTableLines = scanedLines.slice(currentTable.startIndex + 2, currentTable.endIndex);
        currentTableLines.forEach((tableLine, index) => {
            currentTable.align.forEach(v => {
                tableLine = tableLine.replace(alignRegexp, `align='${v || ""}'`)
            })
            scanedLines[currentTable.startIndex + 2 + index] = tableLine;
        });
    }
    //抽取每篇文章的摘要部分
    summary.content = scanedLines.slice(0, summary.slicePoint).filter(line => line.length);
    scanedLines = scanedLines.slice(summary.slicePoint);
    let content = scanedLines.filter(line => line.length);  //处理空行
    //如果文件夹不存在则创建
    if(!existsSync(jsonDirName)) mkdirSync(jsonDirName);
    //如果文件不存在则创建
    //文件存在则进行最后修改日期对比
    let fileName = jsonDirName + mdFileName + '.json';
    try {
        let fileData = readFileSync(fileName);
        let ifModified = statSync(mdDirName + mdFileName).mtime == statSync(fileName).mtime;
        if(!ifModified){
            let oldData = JSON.parse(fileData);
            oldData.content = content;
            oldData.comment = comment;
            oldData.summary = summary.content;
            oldData.anchors = anchors;
            writeFileSync(fileName, JSON.stringify(oldData), error => {
                if(error) console.log(error);
            })
        }
    } catch (error) {
        let data = {
            id : Date.now(),
            comment : comment,
            summary : summary.content,
            author : '',
            anchors : anchors,
            content : [...content]
        };
        writeFileSync(fileName, JSON.stringify(data), error => {
            if(error) console.log(error);
        })
    }
    return fileName;
}
//处理对应内联类型
function parseLines(line){
    let codeArea = [];
    let imgRegexp = /!\[(.*?)\]\((.*?)\)/,
        linkRegexp = /\[(.*?)\]\((.*?)\)/g,
        italicRegexp = /\*(.+?)\*/g,
        boldRegexp = /\*{2}([^\*]+?)\*{2}/g,
        codeRegexp = /`+([^`]*?)`+/g,
        titleRegexp = /^(#+)\s/,
        delRegexp = /~{2}([^~]+?)~{2}/g;
    //标题
    line = line.replace(titleRegexp, '');
    //删除线
    let tempDel = [], dels = [];
    while((tempDel = delRegexp.exec(line)) != null){
        dels.push(tempDel);
    }
    if(dels.length){
        dels.forEach(del => {
            line = line.replace(del[0], `<del>${del[1]}</del>`)
        })
    }
    //图片
    let img = imgRegexp.exec(line);
    img ? line = line.replace(img[0], `<img alt='${img[1] || ""}' title='${img[1] || ""}' src='${img[2] || ""}' >`) : null;
    //链接
    let tempLink = [], links = [];
    while((tempLink = linkRegexp.exec(line)) != null){
        links.push(tempLink);
    }
    if(links.length){
        links.forEach(link => {
            line = line.replace(link[0], `<a title='${link[1]}' href='${link[2]}'>${link[1]}</a>`)
        });
    }
    //行内代码
      //需要注意 <!doctype html> 的转义
    let tempCode = [], codes = [];
    while((tempCode = codeRegexp.exec(line)) != null){
        codes.push(tempCode);
    }
    if(codes.length){
        let lt = /</g,
            gt = />/g;
        codes.forEach(code => {
            code[1] = code[1].replace(lt, '&lt;').replace(gt, '&gt;');
            line = line.replace(code[0], `<code>${code[1]}</code>`)
        })
    }
    //粗体
    let tempBold = [], bolds = [];
    while((tempBold = boldRegexp.exec(line)) != null){
        bolds.push(tempBold);
    }
    if(bolds.length){
        bolds.forEach(blod => {
            line = line.replace(blod[0], `<strong>${blod[1]}</strong>`)
        })
    }
    //斜体
    let tempItalic = [], italics = [];
    while((tempItalic = italicRegexp.exec(line)) != null){
        italics.push(tempItalic);
    }
    if(italics.length){
        italics.forEach(italic => {
            line = line.replace(italic[0], `<i>${italic[1]}</i>`)
        })
    }
    return line;
}
//处理表格
function parseTableLines(line, tableLineType){
    //暂时无法解决 table 中转义符的问题 -_-
    let tableLineArr = line.split('|').filter(v => v.length);
    switch(tableLineType){
        case 'table_title': {
            let titleLine = `<thead><tr>`
            tableLineArr.forEach(v => titleLine += `<th>${parseLines(v.trim())}</th>`)
            titleLine += `</tr></thead>`;
            return titleLine;
        }
        case 'table_align': {
            let alignLeft = /^:-+$/,
                alignMiddle = /^:-+:$/,
                alignRight = /^-+:$/;
            return tableLineArr.map(v => {
                v = v.trim();
                if(alignLeft.test(v)) return 'left';
                else if(alignMiddle.test(v)) return 'center';
                else if(alignRight.test(v)) return 'right';
            });
        }
        case 'table_line': {
            let lineLine = `<tr>`;
            tableLineArr.forEach(v => lineLine += `<td align>${parseLines(v.trim())}</td>`)
            lineLine += `</tr>`
            return lineLine;
        }
    }
}
//转义代码行
function escapeCodeLines(line){
    let lt = /</g,
        gt = />/g;
    
    //转义
    line = line.replace(lt, '&lt;').replace(gt, '&gt;');
    //高亮
    return highLightLine(line, 'javascript');
}
function comListLines(oldList, newList){
    //列表相关
    let olRegexp = /^\d{1,2}$/;
    let ulRegexp = /^[*\-+]\s$/;
    let listCtxRegexp = /^\s{2,}/;
    //列表条件抽离
    const liCtx = (line) => listCtxRegexp.test(line);
    const ol = (line) => {
        line = line.trim();
        return line.length >= 2 && olRegexp.test(line.substring(0, line.indexOf('.')));
    }
    let {areaTypes, scanedLines} = oldList;
    return newList.areaTypes.map((lineType, index) => {
        let line = newList.scanedLines[index];
        if(line == ''){
            return lineType;
        }
        else{
            let key = scanedLines.indexOf(line);
            if(key == -1) return lineType;
            else return (areaTypes[key] == 'ol_line' 
            || areaTypes[key] == 'ul_line' 
            || areaTypes[key] == 'ol_lines' 
            || areaTypes[key] == 'ul_lines') ? areaTypes[key] : lineType; 
        }
    })
}
function hasContinuousListLine(list){
    let {areaTypes} = list;
    let listLineBegin = 0, listLineEnd = 1;
    let result = [];
    while(listLineBegin < areaTypes.length && listLineEnd < areaTypes.length){
        if(areaTypes[listLineBegin] == 'ol_line' || areaTypes[listLineBegin] == 'ul_line'){
            if((areaTypes[listLineEnd] == 'ol_line' || areaTypes[listLineEnd] == 'ul_line')){
                listLineEnd ++;
            }
            else{
                if(listLineEnd - listLineBegin > 1) result.push([listLineBegin, listLineEnd - 1]);
                listLineBegin = listLineEnd;
                listLineEnd ++;
            }
        }
        else{
            listLineBegin ++;
            listLineEnd = listLineBegin + 1;
        }
    }
    if((listLineEnd - listLineBegin > 1) && listLineEnd == areaTypes.length) result.push([listLineBegin, listLineEnd - 1]);
    return result;
}