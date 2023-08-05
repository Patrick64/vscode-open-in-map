// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | null;

/**
 * This function is in vscode extension. It will open the given url in a split editor in vscode.
 *
 * @param   {[type]}  url  [url description]
 *
 * @return  {[type]}       [return description]
 */
async function openMapInASplitEditor(selectedText: string, context: vscode.ExtensionContext) {
    const markers = selectedText.split(/\s+/).filter(str => /^\-?\d+(\.\d+)?\,\-?\d+(\.\d+)?$/.test(str)).map(loc => loc.split(','));

    if (markers.length === 0) {
        throw new Error("No latitude/longitude values found. Format should be lat,lng eg `51.501476,-0.140634 51.2341098,-2.5815403`");
    }

    if (!panel) {
        panel = vscode.window.createWebviewPanel(
            'openInMap', // Identifies the type of the webview. Used internally
            'Open in map', // Title of the panel displayed to the user
            vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
            {
                // Enable scripts in the webview
                enableScripts: true,
                // Keep the webview's context even when it's not visible
                retainContextWhenHidden: true
            }
        );

        // Handle the onDidDispose event
        panel.onDidDispose(() => {
            panel = null;
        }, null, context.subscriptions);

        panel.webview.html = await getMapHtml(panel);
    }

    panel.webview.postMessage({ command: 'addMarkers', markers });

    // Make the panel the active tab
    panel.reveal();
}

async function getMapHtml(panel: any): Promise<string>  {
    const scriptPathOnDisk = vscode.Uri.file(path.join(__dirname, 'mapPanel.js'));
    const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk).toString();

    
    const mapHtmlPath = path.join(__dirname, '../mapPanel.html');
    let htmlContent = await fs.promises.readFile(mapHtmlPath, 'utf8');

    // Replace the placeholder with the script tag
    htmlContent = htmlContent.replace('%%scriptUri%%', scriptUri);
    htmlContent = htmlContent.replace('%%cspSource%%', panel.webview.cspSource);

    return htmlContent;

}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.openSelectionInMap', function () {
        // The code you place here will be executed every time your command is executed

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open in map: No editor is active.');
        } else {
            const selections = editor.selections;
            if (selections.length == 0 || (selections.length == 1 && selections[0].isEmpty)) {
                vscode.window.showInformationMessage('Open in map: Nothing selected.');
            } else {
                editor.edit(async (builder) => {
                    try {
                        const locations = [];
                        for (const selection of selections) {
                            if (!selection.isEmpty) {
                                locations.push(editor.document.getText(selection));
                            }
                        }
                        const locationsList = locations.join(' ');
                        if (/^\s+$/.test(locationsList)) {
                            vscode.window.showInformationMessage('Open in map: Nothing selected.');
                        } else {
                            await openMapInASplitEditor(locations.join(' '), context);
                        }
                    } catch (err: any) {
                        vscode.window.showInformationMessage('Open in map: ' + err.message);
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