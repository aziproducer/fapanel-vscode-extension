import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    console.log('FA-PANEL Language Support extension is now active!');
    
    // Language Server設定
    const serverModule = context.asAbsolutePath('out/server.js');
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'fapanel' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    // Language Clientの作成と開始
    client = new LanguageClient(
        'fapanelLanguageServer',
        'FA-PANEL Language Server',
        serverOptions,
        clientOptions
    );

    // リファレンス表示コマンド
    const showReferencesCommand = vscode.commands.registerCommand('fapanel.showReferences', () => {
        vscode.window.showInformationMessage('FA-PANEL References will be shown here');
        // TODO: リファレンスパネルの実装
    });

    // 自動補完プロバイダー（基本実装）
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'fapanel',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                // FA-PANEL固有のキーワード補完
                const completionItems: vscode.CompletionItem[] = [];
                
                // 基本キーワード
                const keywords = ['event', 'var', 'function', 'if', 'else', 'for', 'while', 'return', 'this', 'parent'];
                keywords.forEach(keyword => {
                    const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                    item.detail = `FA-PANEL keyword: ${keyword}`;
                    completionItems.push(item);
                });

                // グローバル関数（:: 記法）
                const globalFunctions = [
                    { name: '::Edit.GetProperty', detail: 'プロパティ取得', snippet: '::Edit.GetProperty(${1:obj}, ${2:prop}, ${3:value})' },
                    { name: '::Edit.SetProperty', detail: 'プロパティ設定', snippet: '::Edit.SetProperty(${1:obj}, ${2:prop}, ${3:value})' },
                    { name: '::Edit.OpenModalDialog', detail: 'ダイアログ表示', snippet: '::Edit.OpenModalDialog(${1:dialog}, ${2:param}, ${3:type})' },
                    { name: '::Edit.GetCurrentObject', detail: '現在オブジェクト取得', snippet: '::Edit.GetCurrentObject()' },
                    { name: '::MsgBox', detail: 'メッセージ表示', snippet: '::MsgBox(${1:message})' },
                    { name: '::GetValueTotalElement', detail: '配列要素数取得', snippet: '::GetValueTotalElement(${1:array})' },
                    { name: '::LeftStr', detail: '文字列左取得', snippet: '::LeftStr(${1:str}, ${2:count})' },
                    { name: '::CloseDialog', detail: 'ダイアログ閉じる', snippet: '::CloseDialog(${1:name})' }
                ];

                globalFunctions.forEach(func => {
                    const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
                    item.detail = func.detail;
                    item.insertText = new vscode.SnippetString(func.snippet);
                    item.documentation = new vscode.MarkdownString(`**${func.name}**\\n\\n${func.detail}`);
                    completionItems.push(item);
                });

                // イベントハンドラーテンプレート
                const eventHandlers = [
                    { name: 'OnInitialize', snippet: 'event OnInitialize()\\n{\\n\\t${1:// 初期化処理}\\n}' },
                    { name: 'OnMouseUp', snippet: 'event OnMouseUp(button)\\n{\\n\\t${1:// マウスアップ処理}\\n}' },
                    { name: 'OnMouseDown', snippet: 'event OnMouseDown(button)\\n{\\n\\t${1:// マウスダウン処理}\\n}' },
                    { name: 'OnTextChanged', snippet: 'event OnTextChanged(&text)\\n{\\n\\t${1:// テキスト変更処理}\\n}' }
                ];

                eventHandlers.forEach(handler => {
                    const item = new vscode.CompletionItem(handler.name, vscode.CompletionItemKind.Snippet);
                    item.detail = `FA-PANEL event handler: ${handler.name}`;
                    item.insertText = new vscode.SnippetString(handler.snippet);
                    completionItems.push(item);
                });

                return completionItems;
            }
        },
        '::', // トリガー文字
        '.' // プロパティアクセス
    );

    context.subscriptions.push(
        showReferencesCommand,
        completionProvider,
        client.start()
    );
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}