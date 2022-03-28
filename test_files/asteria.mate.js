const { Console } = require("console");

/* eslint-disable no-undef */
(function (srcFileContent) {

    let outFileContent = srcFileContent;

    outFileContent = "#include \"asteria.mate.h\"\n"+outFileContent;

    //var_to_auto
    outFileContent = outFileContent.replaceAll(/(^|[\s\n\r])var([\s\n\r])/g, "$1auto$2");
    //const_to_auto
    outFileContent = outFileContent.replaceAll(/(^|[\s\n\r])const([\s\n\r])/g, "$1const auto$2");

    //for var to auto
    outFileContent = outFileContent.replaceAll(/(^|[\s\n\r])for(\s*)\((\s*)var([\s\n\r])/g, "$1for$2($3auto$4");

    //func_to_lambda
    (function(){
        outFileContent=outFileContent.replaceAll(/(^|[\s\n\r])return(\s*-\s*>)/g,"$1return &");
        outFileContent = outFileContent.replaceAll(/(func)(\s*)(\()((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)(\))/g,"[&]$2$3$4$5");
    })();


    //func_to_auto
    (function () {

        let matches = outFileContent.matchAll(/(^|[\s\n\r])(func)([\s\n\r])(\S+)(\s*)(\()((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)(\))/g);
        let functionkeywordSnumber = 2;
        let parameterSnumber = 7;
        let addLength = 0;
        for (let match of matches) {
            //parameter to auto parameter
            let parameterstring = match[parameterSnumber];
            //  1 - 6 elements string length sum
            let init_index = match.index+addLength;
            let parameters_index=init_index;
            for (let i = 1; i < parameterSnumber; i++) {
                parameters_index += match[i].length;
            }
            let length = parameterstring.length;

            let newparameterstring = parameterstring;
            //judge string contain not space
            if (!parameterstring.match(/\S/g)) {
                continue;
            }
            else if (!parameterstring.match(/,/g)) {
                newparameterstring = " auto " + parameterstring;
            }
            else {
                //every string array element + "auto " and concat as a new string
                newparameterstring = parameterstring.split(",").map(function (element) {
                    return " auto " + element;
                }).join(",");
                //replace old parameter string with new one
            }
            let temp_length_newparameterstring=newparameterstring.length;
            newparameterstring=newparameterstring.replace(/\.\.\./g,"... __varg_ps");

            outFileContent = outFileContent.substring(0, parameters_index) + newparameterstring + outFileContent.substring(parameters_index + length);
            addLength += newparameterstring.length - length;

            if (temp_length_newparameterstring!=newparameterstring.length)
            {
                outFileContent=outFileContent.substring(0,parameters_index+newparameterstring.length)+outFileContent.substring(parameters_index+newparameterstring.length).replace(/{/g,"{\n  auto __varg = __varg_make(__varg_ps...);\n");
            }

            //function keyword to auto
            let function_index = init_index;
            for (let i = 1; i < functionkeywordSnumber; i++) {
                function_index += match[i].length;
            }
            let autokeyword = "auto";
            outFileContent = outFileContent.substring(0, function_index) + autokeyword + outFileContent.substring(function_index + match[functionkeywordSnumber].length);
            addLength += autokeyword.length - match[functionkeywordSnumber].length;
            
        }
    })();



    return outFileContent;
});