# VSCode LSP Reglace

Replace by regex

Automatically replace and generate files according to the rules set by the user.

Add a *regmake.json* in work dictionary.

Such as

```json
[
    {
        "rules": [
            "asteria.mate.js"
        ],
        "replace": [
            {
                "src": "asteria.mate",
                "out": "asteria.cpp"
            }
        ]
    }
]
```

rule file is a javascript file contained a lambda function

Such as:

```javascript
(function(srcFileContent){
return outFileContent
});
```

To facilitate comparison between src file and out file, vscode will automatically open the comparison window when the mouse points to the text.

## A Sample ([sample files is here](https://github.com/LiXiaYu/reglace_vsc/tree/test_asteria))

*asteria.mate.js*

```javascript
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
```


Reglace will read context from *asteria.mate*, run function in asteria.mate.js.

```cpp
var foo;
// `foo` refers to a "variable" holding `null`.

const inc = 42;
// `inc` refers to an "immutable variable" holding an `integer` of `42`.

var bar = func() { return->inc; }; // return by reference
// `bar` refers to an "immutable variable" holding a function.
// `bar()` refers to the same "variable" as `inc`.

func add(x) { return x + inc; }; // return by value
                                 // `add` refers to an "immutable variable" holding a function.
                                 // `add(5)` refers to a "temporary" holding an `integer` of `47`.

func pargs(a, b, ...) {
  std.io.putf("named argument `a` = $1\n", a);
  std.io.putf("named argument `b` = $1\n", b);

  std.io.putf("variadic argument count = $1\n", __varg());
  for(var i = 0; i != __varg(); ++i)
    std.io.putf("variadic argument [$1] = $2\n", i, __varg(i));
}
```

Then *asteria.cpp* will be generated.

```cpp
#include "asteria.mate.h"
auto foo;
// `foo` refers to a "variable" holding `null`.

const auto inc = 42;
// `inc` refers to an "immutable variable" holding an `integer` of `42`.

auto bar = [&]() { return &inc; }; // return by reference
// `bar` refers to an "immutable variable" holding a function.
// `bar()` refers to the same "variable" as `inc`.

auto add( auto x) { return x + inc; }; // return by value
                                 // `add` refers to an "immutable variable" holding a function.
                                 // `add(5)` refers to a "temporary" holding an `integer` of `47`.

auto pargs( auto a, auto  b, auto  ... __varg_ps) {
  auto __varg = __varg_make(__varg_ps...);

  std.io.putf("named argument `a` = $1\n", a);
  std.io.putf("named argument `b` = $1\n", b);

  std.io.putf("variadic argument count = $1\n", __varg());
  for(auto i = 0; i != __varg(); ++i)
    std.io.putf("variadic argument [$1] = $2\n", i, __varg(i));
}
```

In particular, the referenced header file *asteria.mate.h* requires the user to provide.

```cpp
#pragma once
auto __varg_make(auto& ...__varg_ps)
{
    return [&](auto ...i) {
        static_assert(sizeof...(i) == 0 || sizeof...(i) == 1, "__varg() parameters error");
        auto __varg_il = { __varg_ps... };
        if constexpr (sizeof...(i) == 0) {
            return __varg_il.size();
        }
        else {
            auto i_il = { i... };
            return __varg_il.begin()[i_il.begin()[0]];
        }
    };
}
```




No more...
