import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult,
    HoverParams,
    Hover,
    MarkupKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// サーバー接続の作成
const connection = createConnection(ProposedFeatures.all);

// ドキュメント管理
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['::', '.', '<']
            },
            hoverProvider: true
        }
    };

    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }

    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});

// FA-PANEL API定義
interface FAPanelFunction {
    name: string;
    description: string;
    parameters: string[];
    returnType: string;
    example: string;
}

const fapanelAPI: FAPanelFunction[] = [
    {
        name: '::Edit.GetProperty',
        description: 'オブジェクトのプロパティ値を取得します',
        parameters: ['obj: Object', 'propertyName: string', 'value: any'],
        returnType: 'boolean',
        example: '::Edit.GetProperty(vObj, "_Property", vValue)'
    },
    {
        name: '::Edit.SetProperty',
        description: 'オブジェクトのプロパティ値を設定します',
        parameters: ['obj: Object', 'propertyName: string', 'value: any'],
        returnType: 'void',
        example: '::Edit.SetProperty(vObj, "_Property", vValue)'
    },
    {
        name: '::Edit.OpenModalDialog',
        description: 'モーダルダイアログを表示します',
        parameters: ['dialogName: string', 'parameter: any', 'dialogType: string'],
        returnType: 'any',
        example: '::Edit.OpenModalDialog("Dlg.System", param, "DlgEditor")'
    },
    {
        name: '::Edit.GetCurrentObject',
        description: '現在のオブジェクトを取得します',
        parameters: [],
        returnType: 'Object',
        example: '::Edit.GetCurrentObject()'
    },
    {
        name: '::MsgBox',
        description: 'メッセージボックスを表示します',
        parameters: ['message: string'],
        returnType: 'void',
        example: '::MsgBox("Hello World")'
    },
    {
        name: '::GetValueTotalElement',
        description: '配列の要素数を取得します',
        parameters: ['array: Array'],
        returnType: 'number',
        example: '::GetValueTotalElement(vArray)'
    },
    {
        name: '::LeftStr',
        description: '文字列の左から指定した文字数を取得します',
        parameters: ['str: string', 'count: number'],
        returnType: 'string',
        example: '::LeftStr("Hello", 3)'
    },
    {
        name: '::CloseDialog',
        description: 'ダイアログを閉じます',
        parameters: ['dialogName: string'],
        returnType: 'void',
        example: '::CloseDialog("DialogName")'
    },
    {
        name: '::RightStr',
        description: '文字列の右から指定した文字数を取得します',
        parameters: ['str: string', 'count: number'],
        returnType: 'string',
        example: '::RightStr("Hello", 3)'
    },
    {
        name: '::MidStr',
        description: '文字列の指定位置から指定文字数を取得します',
        parameters: ['str: string', 'start: number', 'count: number'],
        returnType: 'string',
        example: '::MidStr("Hello", 2, 2)'
    },
    {
        name: '::StrLen',
        description: '文字列の長さを取得します',
        parameters: ['str: string'],
        returnType: 'number',
        example: '::StrLen("Hello")'
    },
    {
        name: '::Val',
        description: '文字列を数値に変換します',
        parameters: ['str: string'],
        returnType: 'number',
        example: '::Val("123")'
    },
    {
        name: '::Str',
        description: '数値を文字列に変換します',
        parameters: ['num: number'],
        returnType: 'string',
        example: '::Str(123)'
    },
    {
        name: '::IsObj',
        description: 'オブジェクトかどうかを判定します',
        parameters: ['value: any'],
        returnType: 'boolean',
        example: '::IsObj(vValue)'
    },
    {
        name: '::OpenViewForm',
        description: 'ビューフォームを開きます',
        parameters: ['frameName: string', 'formName: string', 'viewName: string', 'stretchMode: string'],
        returnType: 'void',
        example: '::OpenViewForm("FrameMain", "FormName", "ViewName", "STRETCH_FULL")'
    },
    {
        name: '::Edit.GetPropertyAttr',
        description: 'プロパティの属性情報を取得します',
        parameters: ['attrName: string', 'obj: Object', 'propertyName: string', 'value: any'],
        returnType: 'boolean',
        example: '::Edit.GetPropertyAttr("ENUMLIST", vObj, "_Property", vEnumList)'
    },
    {
        name: '::Edit.SetPropertyAttr',
        description: 'プロパティの属性情報を設定します',
        parameters: ['attrName: string', 'obj: Object', 'propertyName: string', 'value: any'],
        returnType: 'void',
        example: '::Edit.SetPropertyAttr("CANBEEMPTY", vObj, "_Property", true)'
    },
    {
        name: '::ShowComment',
        description: 'コメントを表示します',
        parameters: ['show: boolean', 'level: number', 'propertyName: string'],
        returnType: 'void',
        example: '::ShowComment(true, 1, "ToolTipText")'
    },
    {
        name: '::Title',
        description: 'ウィンドウタイトルを設定します',
        parameters: ['title: string'],
        returnType: 'void',
        example: '::Title = "New Window Title"'
    },
    {
        name: '::StrFind',
        description: '文字列内で指定した文字列を検索します',
        parameters: ['str: string', 'searchStr: string', 'startPos?: number'],
        returnType: 'number',
        example: '::StrFind("Hello World", "World")'
    },
    {
        name: '::StrReplace',
        description: '文字列内の指定した文字列を置換します',
        parameters: ['str: string', 'searchStr: string', 'replaceStr: string'],
        returnType: 'string',
        example: '::StrReplace("Hello World", "World", "Universe")'
    },
    {
        name: '::Int',
        description: '数値を整数に変換します',
        parameters: ['num: number'],
        returnType: 'number',
        example: '::Int(3.14)'
    },
    {
        name: '::Float',
        description: '数値を浮動小数点数に変換します',
        parameters: ['num: any'],
        returnType: 'number',
        example: '::Float("3.14")'
    },
    {
        name: '::IsArray',
        description: '配列かどうかを判定します',
        parameters: ['value: any'],
        returnType: 'boolean',
        example: '::IsArray(vValue)'
    },
    {
        name: '::IsNull',
        description: 'NULL値かどうかを判定します',
        parameters: ['value: any'],
        returnType: 'boolean',
        example: '::IsNull(vValue)'
    }
,
    {
        name: '::StrUpper',
        description: '文字列を大文字に変換します',
        parameters: ['str: string'],
        returnType: 'string',
        example: '::StrUpper("hello")'
    },
    {
        name: '::StrLower',
        description: '文字列を小文字に変換します',
        parameters: ['str: string'],
        returnType: 'string',
        example: '::StrLower("HELLO")'
    }
];

const fapanelProperties = [
    { name: 'Text', description: 'コントロールのテキストを取得/設定' },
    { name: 'Enabled', description: 'コントロールの有効/無効状態' },
    { name: 'Visible', description: 'コントロールの表示/非表示状態' },
    { name: 'Top', description: 'コントロールの上端座標' },
    { name: 'Left', description: 'コントロールの左端座標' },
    { name: 'Height', description: 'コントロールの高さ' },
    { name: 'Width', description: 'コントロールの幅' },
    { name: 'ToolTipText', description: 'ツールチップテキスト' },
    { name: 'Tag', description: 'コントロールのタグ値' },
    { name: 'Name', description: 'コントロールの名前' },
    { name: 'ClassId', description: 'コントロールのクラスID' },
    { name: 'ClassId2', description: 'コントロールの詳細クラスID' }
];

const fapanelMethods = [
    { name: 'SetFocus', description: 'コントロールにフォーカスを設定' },
    { name: 'LostFocus', description: 'コントロールからフォーカスを外す' },
    { name: 'SetSel', description: 'テキストの選択範囲を設定' },
    { name: 'AddText', description: 'リストアイテムを追加' },
    { name: 'GetData', description: 'リストアイテムのデータを取得' },
    { name: 'SelectIndex', description: 'リストアイテムを選択' },
    { name: 'FindData', description: 'データからインデックスを検索' }
];

const fapanelEvents = [
    'OnInitialize', 'OnMouseUp', 'OnMouseDown', 'OnTextChanged', 
    'OnSelectChanged', 'OnKeyDown', 'OnKeyUp', 'OnFocus', 'OnBlur'
];

const fapanelKeywords = [
    'event', 'var', 'function', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'default', 'break', 'continue', 'return', 
    'this', 'parent', 'true', 'false', 'c'
];

// 自動補完機能
connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        const document = documents.get(_textDocumentPosition.textDocument.uri);
        if (!document) {
            return [];
        }

        const position = _textDocumentPosition.position;
        const text = document.getText();
        const lines = text.split('\n');
        const currentLine = lines[position.line];
        const linePrefix = currentLine.substring(0, position.character);

        const completionItems: CompletionItem[] = [];

        // グローバル関数の補完（:: で始まる場合）
        if (linePrefix.endsWith('::') || linePrefix.includes('::')) {
            fapanelAPI.forEach((func, index) => {
                const item: CompletionItem = {
                    label: func.name,
                    kind: CompletionItemKind.Function,
                    data: index,
                    detail: func.description,
                    documentation: {
                        kind: MarkupKind.Markdown,
                        value: `**${func.name}**\\n\\n${func.description}\\n\\n**Parameters:** ${func.parameters.join(', ')}\\n\\n**Returns:** ${func.returnType}\\n\\n**Example:**\\n\`\`\`fapanel\\n${func.example}\\n\`\`\``
                    },
                    insertText: func.name.replace('::', '') + '(${1})',
                    insertTextFormat: 2 // Snippet
                };
                completionItems.push(item);
            });
        }

        // プロパティ・メソッドの補完（. で始まる場合）
        if (linePrefix.endsWith('.')) {
            // プロパティ
            fapanelProperties.forEach(prop => {
                completionItems.push({
                    label: prop.name,
                    kind: CompletionItemKind.Property,
                    detail: prop.description,
                    insertText: prop.name
                });
            });

            // メソッド
            fapanelMethods.forEach(method => {
                completionItems.push({
                    label: method.name,
                    kind: CompletionItemKind.Method,
                    detail: method.description,
                    insertText: method.name + '(${1})',
                    insertTextFormat: 2 // Snippet
                });
            });
        }

        // イベントハンドラーの補完（event キーワードの後）
        if (linePrefix.includes('event ')) {
            fapanelEvents.forEach(event => {
                completionItems.push({
                    label: event,
                    kind: CompletionItemKind.Event,
                    detail: `FA-PANEL event: ${event}`,
                    insertText: event + '(${1})\\n{\\n\\t${2:// イベント処理}\\n}',
                    insertTextFormat: 2 // Snippet
                });
            });
        }

        // キーワードの補完
        fapanelKeywords.forEach(keyword => {
            completionItems.push({
                label: keyword,
                kind: CompletionItemKind.Keyword,
                detail: `FA-PANEL keyword: ${keyword}`
            });
        });

        // XML要素の補完（< で始まる場合）
        if (linePrefix.endsWith('<')) {
            const xmlElements = [
                'OBJ', 'ROOT', 'FORMROOT', 'FRAMESET', 'FRAME'
            ];
            xmlElements.forEach(element => {
                completionItems.push({
                    label: element,
                    kind: CompletionItemKind.Class,
                    detail: `FA-PANEL XML element: ${element}`,
                    insertText: element + ' ${1}>${2}</' + element + '>',
                    insertTextFormat: 2 // Snippet
                });
            });
        }

        return completionItems;
    }
);

// 補完アイテムの詳細情報
connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        if (item.data !== undefined && item.data < fapanelAPI.length) {
            const func = fapanelAPI[item.data];
            item.detail = func.description;
            item.documentation = {
                kind: MarkupKind.Markdown,
                value: `**${func.name}**\\n\\n${func.description}\\n\\n**Parameters:** ${func.parameters.join(', ')}\\n\\n**Returns:** ${func.returnType}\\n\\n**Example:**\\n\`\`\`fapanel\\n${func.example}\\n\`\`\``
            };
        }
        return item;
    }
);

// ホバー情報
connection.onHover(
    (params: HoverParams): Hover | null => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return null;
        }

        const position = params.position;
        const text = document.getText();
        const offset = document.offsetAt(position);
        
        // 現在の単語を取得
        const wordStart = text.lastIndexOf(' ', offset) + 1;
        const wordEnd = text.indexOf(' ', offset);
        const word = text.substring(wordStart, wordEnd === -1 ? text.length : wordEnd);

        // API関数の情報を検索
        const apiFunc = fapanelAPI.find(func => word.includes(func.name.replace('::', '')));
        if (apiFunc) {
            return {
                contents: {
                    kind: MarkupKind.Markdown,
                    value: `**${apiFunc.name}**\\n\\n${apiFunc.description}\\n\\n**Parameters:** ${apiFunc.parameters.join(', ')}\\n\\n**Returns:** ${apiFunc.returnType}\\n\\n**Example:**\\n\`\`\`fapanel\\n${apiFunc.example}\\n\`\`\``
                }
            };
        }

        return null;
    }
);

// ドキュメント変更時の診断
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const text = textDocument.getText();
    const diagnostics: Diagnostic[] = [];
    
    // 基本的な構文チェック
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 括弧の対応チェック
        const openBraces = (line.match(/\\{/g) || []).length;
        const closeBraces = (line.match(/\\}/g) || []).length;
        if (openBraces !== closeBraces && line.includes('{') && line.includes('}')) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: { line: i, character: 0 },
                    end: { line: i, character: line.length }
                },
                message: '括弧の対応が正しくない可能性があります',
                source: 'FA-PANEL Language Server'
            });
        }
        
        // 未終了文字列のチェック
        const quotes = (line.match(/"/g) || []).length;
        if (quotes % 2 !== 0) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: { line: i, character: 0 },
                    end: { line: i, character: line.length }
                },
                message: '文字列が正しく終了していません',
                source: 'FA-PANEL Language Server'
            });
        }
    }

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// ドキュメント管理
documents.listen(connection);
connection.listen();