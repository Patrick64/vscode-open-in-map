
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
export async function openMapInWebview(selectedText: string, context: vscode.ExtensionContext) {
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
    const scriptPathOnDisk = vscode.Uri.file(path.join(__dirname, '../mapPanel.js'));
    const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk).toString();

    
    const mapHtmlPath = path.join(__dirname, '../mapPanel.html');
    let htmlContent = await fs.promises.readFile(mapHtmlPath, 'utf8');

    // Replace the placeholder with the script tag
    htmlContent = htmlContent.replaceAll('%%scriptUri%%', scriptUri);
    htmlContent = htmlContent.replaceAll('%%cspSource%%', panel.webview.cspSource);

    return htmlContent;

}
