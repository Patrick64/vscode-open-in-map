// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { openMapInWebview } from './openMapInWebview';

function openSelectionInMap(context: vscode.ExtensionContext) {
  // The code you place here will be executed every time your command is executed

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('Open in map: No editor is active.');
  } else {
    const selections = editor.selections;
    if (
      selections.length === 0 ||
      (selections.length === 1 && selections[0].isEmpty)
    ) {
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
            vscode.window.showInformationMessage(
              'Open in map: Nothing selected.'
            );
          } else {
            await openMapInWebview(locations.join(' '), context);
          }
        } catch (err: any) {
          vscode.window.showInformationMessage('Open in map: ' + err.message);
        }
      });
    }
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'openinmap.openSelectionInMap',
    () => {
      openSelectionInMap(context);
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
