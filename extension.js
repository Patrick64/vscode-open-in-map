const fs = require('fs').promises;
const path = require('path');

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

let panel;

/**
 * This function is in vscode extension. It will open the given url in a split editor in vscode.
 *
 * @param   {[type]}  url  [url description]
 *
 * @return  {[type]}       [return description]
 */
async function openMapInASplitEditor(latlng) {
    if (!panel) {
        panel = vscode.window.createWebviewPanel(
            'webView', // Identifies the type of the webview. Used internally
            'WebView', // Title of the panel displayed to the user
            vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
            {
                // Enable scripts in the webview
                enableScripts: true
            }
        );
        
        panel.webview.html = await getMapHtml();
    }

    // Assume latlng is in the format "lat,lng"
    let [lat, lng] = latlng.split(',');
    const markers = latlng.split(/\s+/).filter(str => /^\-?\d+(\.\d+)?\,\-?\d+(\.\d+)?$/.test(str)).map(loc => loc.split(','));

    panel.webview.postMessage({ command: 'addMarkers', markers });
}

async function getMapHtml() {
    const mapHtmlPath = path.join(__dirname, 'mapPanel.html');
    return  await fs.readFile(mapHtmlPath, 'utf8');
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "escape-regexp" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.openSelectionInMap', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open in map: No editor is active.');
        } else {
            const selections = editor.selections;
            if (selections.length == 0 || (selections.length == 1 && selections[0].isEmpty)) {
                vscode.window.showInformationMessage('Open in map: Nothing selected.');
            } else {
                editor.edit(builder => {
                    const locations = [];
                    for (const selection of selections) {
                        if (!selection.isEmpty) {
                            locations.push(editor.document.getText(selection));
                        }
                    }
                    const locationsList = locations.join(' ');
                    if (/^\s+$/.test(locationsList)) {
                        vscode.window.showInformationMessage('Open in map: empty selection');
                    } else {
                        openMapInASplitEditor(locations.join(' '));
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