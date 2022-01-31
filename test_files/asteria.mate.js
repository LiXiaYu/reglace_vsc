/* eslint-disable no-undef */
(function(srcFileContent){

    let outFileContent=srcFileContent;
    //let_to_auto
    outFileContent=outFileContent.replaceAll(/(^|[\s\n\r])let([\s\n\r])/g, "$1auto$2");
    console.log("let_to_auto\n", outFileContent);

    //function_to_auto
    let matches=outFileContent.matchAll(/(^|[\s\n\r])(function)([\s\n\r])(\S+)(\s*)(\()((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)(\))/g);
    let functionkeywordSnumber=2;
    let parameterSnumber=7;
    let addLength=0;
    for (let match of matches) {
        let parameterstring=match[parameterSnumber];
        //  1 - 6 elements string length sum
        let index=match.index;
        for(let i=1;i<parameterSnumber;i++){
            index+=match[i].length;
        }
        index+=addLength;
        let length=parameterstring.length;
        
        let newparameterstring=parameterstring;
        //judge string contain not space
        if(!parameterstring.match(/\S/g)){
            continue;
        }
        else if(!parameterstring.match(/,/g))
        {
            newparameterstring=" auto "+parameterstring;
        }
        else
        {
            //every string array element + "auto " and concat as a new string
            newparameterstring=parameterstring.split(",").map(function(element){
                return " auto "+element;
            }).join(",");
            //replace old parameter string with new one
        }
        console.log("1111:\n"+outFileContent.substring(0,index));
        console.log("2222:\n"+outFileContent.substring(index+length));
        outFileContent=outFileContent.substring(0,index)+newparameterstring+outFileContent.substring(index+length);
        addLength+=newparameterstring.length-length;

        let function_index=match.index;
        for(let i=1;i<functionkeywordSnumber;i++)
        {
            function_index+=match[i].length;
        }
        let autokeyword="auto";
        outFileContent=outFileContent.substring(0,function_index)+autokeyword+outFileContent.substring(function_index+match[functionkeywordSnumber].length);
        addLength+=autokeyword.length-match[functionkeywordSnumber].length;
    }


    return outFileContent;
});