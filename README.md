# VSCode LSP Reglace

Replace by regex

Automatically replace and generate files according to the rules set by the user.

Add a regmake.json in work dictionary.

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



No more...
