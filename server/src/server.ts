/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  HoverParams,
  Hover,
  SignatureHelpParams,
  SignatureHelp,
  DocumentFormattingParams,
  TextEdit,
  DocumentHighlightParams,
  DocumentHighlight,
  DocumentHighlightKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import * as fs from 'fs';
import * as reglace from './reglace';

// 关键点1： 初始化 LSP 连接对象
const connection = createConnection(ProposedFeatures.all);

// 关键点2： 创建文档集合对象，用于映射到实际文档
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
  // 明确声明插件支持的语言特性
  const result: InitializeResult = {
    capabilities: {
      // 传全量模式
      textDocumentSync: {
        openClose: true,
        change: TextDocumentSyncKind.Full
      },
      // 代码补全
      completionProvider: {
        resolveProvider: true,
      },
      // hover 提示
      hoverProvider: true,
      // 签名提示
      signatureHelpProvider: {
        triggerCharacters: ["("],
      },
      // 语言高亮
      documentHighlightProvider: true
      // code action

    },
  };
  return result;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

import { mainModule, version } from 'process';
import { Console } from "console";
console.log(`Version: ${version}`);


// 全部的regmake，记录下来，用于随时获取
let regmake: any[];

// 全量诊断
documents.onDidChangeContent((e) => {
  const textDocument = e.document;

  const diagnostics: Diagnostic[] = [];

  //遍历上级目录
  let uri = textDocument.uri;
  let regmakeFilePath: null | string = null;
  do {
    // get parentpath
    uri = uri.substring(0, uri.lastIndexOf('/'));
    // find file if exist
    // path join
    const filePath = (uri + '/regmake.json').substring(7);
    if (fs.existsSync(filePath)) {
      const makes = reglace.getReglaceMake(filePath);
      regmakeFilePath = filePath;
      break;
    }
  } while (uri == 'file:///');

  if (regmakeFilePath == null) {
    // 没有找到 regmake.json 文件
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 },
      },
      message: 'No regmake.json found',
      source: "reglace Make"
    });
  }
  else {
    console.log(`regmakeFilePath: ${regmakeFilePath}`);

    // 获取 reglace Make
    regmake = reglace.getReglaceMake(regmakeFilePath);
    console.log('regmake: ', regmake);
    // 遍历json
    for (const r of regmake) {
      const rules = r["rules"];
      const rcpps = r["replace"];

      reglace.reglaceJss(rcpps, rules);
    }

    console.log(regmake);

  }
  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
});

connection.onHover((params: HoverParams): Promise<Hover> => {

  let isSrc = false;
  let srcfilepath = '';
  let outfilepath = '';
  //find filepath in regmake.json
  const filepath = params.textDocument.uri.substring(7);
  for (const r of regmake) {
    const rules = r["rules"];
    const rcpps = r["replace"];
    for (const rcpp of rcpps) {
      if (fs.realpathSync(filepath) == fs.realpathSync(rcpp['src'])) {
        isSrc = true;
        outfilepath = fs.realpathSync(rcpp['out']);
        srcfilepath = fs.realpathSync(rcpp['src']);
        break;
      }
    }
  }

  if (isSrc) {
    connection.sendNotification('custom/showdiffwindow', [srcfilepath, outfilepath]);
    return Promise.resolve({
      contents: ["A reglace out file: " + outfilepath]
    });
  }
  else {
    return Promise.resolve({
      contents: []
    });
  }

});

connection.onDocumentHighlight(
  (params: DocumentHighlightParams): Promise<DocumentHighlight[]> => {
    const { textDocument } = params;
    const doc = documents.get(textDocument.uri)!;
    const text = doc.getText();
    const pattern = /\btecvan\b/i;
    const res: DocumentHighlight[] = [];
    let match;
    while ((match = pattern.exec(text))) {
      res.push({
        range: {
          start: doc.positionAt(match.index),
          end: doc.positionAt(match.index + match[0].length),
        },
        kind: DocumentHighlightKind.Write,
      });
    }
    return Promise.resolve(res);
  }
);

connection.onSignatureHelp(
  (params: SignatureHelpParams): Promise<SignatureHelp> => {
    return Promise.resolve({
      signatures: [
        {
          label: "Signature Demo",
          documentation: "human readable content",
          parameters: [
            {
              label: "@p1 first param",
              documentation: "content for first param",
            },
          ],
        },
      ],
      activeSignature: 0,
      activeParameter: 0,
    });
  }
);

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    return [
      {
        label: "Tecvan",
        kind: CompletionItemKind.Text,
        data: 1,
      },
      {
        label: "JavaScript",
        kind: CompletionItemKind.Text,
        data: 2,
      },
    ];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  console.log("request completion resolve");
  if (item.data === 1) {
    item.detail = "Tecvan is Awesome";
    item.documentation = "公众号：Tecvan";
  } else if (item.data === 2) {
    item.detail = "Tecvan is Good At Javascript";
    item.documentation = "公众号：Tecvan";
  }
  return item;
});
