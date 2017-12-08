// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "escape-regexp" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.escapeRegexp', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Escape Regular Expression: No editor is active.');
        } else {
            const selections = editor.selections;
            if (selections.length == 0 || selections[0].isEmpty) {
                vscode.window.showInformationMessage('Escape Regular Expression: Nothing selected.');
            } else {
                editor.edit(builder => {
                    for (const selection of selections) {
                        let text = editor.document.getText(selection);
                        let escapedRegex = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        builder.replace(selection, escapedRegex);
                    }
                });
            }
        }
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;