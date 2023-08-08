import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | null;

/**
 * Opens a map with the specified latitude and longitude markers in a split editor within VS Code.
 * 
 * @param selectedText - A string containing latitude and longitude values.
 * @param context - The extension context provided by VS Code.
 * @throws Will throw an error if the format of the selectedText is not correct.
 */
export async function openMapInWebview(selectedText: string, context: vscode.ExtensionContext): Promise<void> {
    const markers = convertStrToMarkers(selectedText);
    
    if (markers.length === 0) {
        throw new Error("No latitude/longitude values found. Format should be lat,lng.");
    }

    if (!panel) {
        initializePanel(context);
    }

    if (panel) {
        panel.webview.postMessage({ command: 'addMarkers', markers });
        panel.reveal();
    }
}

/**
 * Converts a string containing latitude and longitude values to an array of [lat, lng] pairs.
 * 
 * @param str - A string containing latitude and longitude values.
 * @returns An array of [lat, lng] pairs.
 */
export function convertStrToMarkers(str: string): string[][] {
    const regex = /(\-?\d+(\.\d+)?\s*,\s*\-?\d+(\.\d+)?)/g;
    const pairs = str.match(regex);

    return (pairs ?? []).map(latlng => latlng.split(',').map(num => num.trim()));
}

/**
 * Initializes the webview panel to display the map.
 * 
 * @param context - The extension context provided by VS Code.
 */
export async function initializePanel(context: vscode.ExtensionContext): Promise<void> {
    panel = vscode.window.createWebviewPanel(
        'openInMap', 
        'Open in map', 
        vscode.ViewColumn.Beside, 
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.onDidDispose(() => {
        panel = null;
    }, null, context.subscriptions);

    panel.webview.html = await getMapHtml(panel);
}

/**
 * Generates the HTML content for the webview panel by replacing placeholders with actual script paths.
 * 
 * @param panel - The webview panel to generate the HTML content for.
 * @returns The HTML content as a string.
 */
export async function getMapHtml(panel: vscode.WebviewPanel): Promise<string> {
    const scriptPathOnDisk = vscode.Uri.file(path.join(__dirname, '../mapPanel.js'));
    const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk).toString();

    const mapHtmlPath = path.join(__dirname, '../mapPanel.html');
    let htmlContent = await fs.promises.readFile(mapHtmlPath, 'utf8');

    return htmlContent.replace(/%%scriptUri%%/g, scriptUri).replace(/%%cspSource%%/g, panel.webview.cspSource);
}
