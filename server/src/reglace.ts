import * as fs from 'fs';
//读取json函数
function readJson(filePath: string): any {
    //读取json文件
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    //转换为json对象
    const jsonObj = JSON.parse(jsonData);
    return jsonObj;
}

function getReglaceRules(filePath: string): any {
    const jsonRules = readJson(filePath);

    return jsonRules;
}

export function getReglaceMake(filePath: string): any {
    const jsonMake = readJson(filePath);

    return jsonMake;
}

export function reglaceJss(srcandoutFilePaths: any, reglaceJsPaths: Array<string>) {
    for (const srcandoutFilePath of srcandoutFilePaths) {
        for (const reglaceJsPath of reglaceJsPaths) {
            reglaceJs(srcandoutFilePath["src"], srcandoutFilePath["out"], reglaceJsPath);
        }
    }
}

export function reglaceJs(srcFilePath: string, outFilePath: string, reglaceJsPath: any) {
    const srcFileContent = fs.readFileSync(srcFilePath, 'utf-8');

    //load a js file
    const jsFile = fs.readFileSync(reglaceJsPath, 'utf-8');
    //eval the js file
    const jsObj = eval(jsFile);
    console.log("jsObj: ", jsObj);
    const outFileContent = jsObj(srcFileContent);
    console.log("outFileContent: ", outFileContent);
    fs.writeFileSync(outFilePath, outFileContent);
}


export function reglaceFiles(srcandoutFilePaths: any, reglaceFilePaths: Array<string>) {
    let reglaceRules: any[] = [];
    for (const index in reglaceFilePaths) {
        // 合并两个数组
        reglaceRules = reglaceRules.concat(getReglaceRules(reglaceFilePaths[index]));
    }

    for (const index in srcandoutFilePaths) {
        reglaceFile(srcandoutFilePaths[index]["src"], srcandoutFilePaths[index]["out"], reglaceRules);
    }
}

export function reglaceFile(srcFilePath: string, outFilePath: string, reglaceRules: any): void {
    const srcFileContent = fs.readFileSync(srcFilePath, 'utf-8');
    const outFileContent = reglace(srcFileContent, reglaceRules);
    fs.writeFileSync(outFilePath, outFileContent);
}

export function reglace(srcFileContent: string, reglaceRules: any): string {
    let outFileContent = srcFileContent;
    do {
        for (const index in reglaceRules) {
            const name = reglaceRules[index]["name"];
            const rule = reglaceRules[index]["rule"];
            const search = new RegExp(rule["search"], "g");
            const replace: string = rule["replace"];

            //正则搜索，记录所有匹配的结果的位置
            // const matches = outFileContent.match(search);
            // if (matches != null) {
            //     //遍历匹配的结果
            //     for (const match of matches) {
            //         //记录index和内容
            //         const index = outFileContent.indexOf(match);
            //     }
            // }

            //正则替换
            outFileContent = outFileContent.replaceAll(search, replace);
        }
    } while (outFileContent != srcFileContent); // 什么解不动点，就不动了

    return outFileContent;
}