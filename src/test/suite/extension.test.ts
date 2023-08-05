import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { openMapInWebview, getMapHtml } from '../../openMapInWebview';
import * as openMapInWebviewModule from '../../openMapInWebview';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  let createWebviewPanelStub: sinon.SinonStub;
  let onDidDisposeStub: sinon.SinonStub;
  let getMapHtmlStub: sinon.SinonStub;
  let asWebviewUriStub: sinon.SinonStub;
  let revealStub: sinon.SinonStub;
  let postMessageStub: sinon.SinonStub;

  setup(() => {
    // Stub the getMapHtml function to return a fixed string
    getMapHtmlStub = sinon
      .stub(openMapInWebviewModule, 'getMapHtml')
      .returns(Promise.resolve('<html></html>'));
    onDidDisposeStub = sinon.stub();
    postMessageStub = sinon.stub();
    revealStub = sinon.stub();
    asWebviewUriStub = sinon.stub().returns(vscode.Uri.parse('someUri'));
    createWebviewPanelStub = sinon
      .stub(vscode.window, 'createWebviewPanel')
      .returns({
        onDidDispose: onDidDisposeStub,
        reveal: revealStub,
        webview: {
          postMessage: postMessageStub,
          asWebviewUri: asWebviewUriStub,
        },
      } as unknown as vscode.WebviewPanel);
  });

  teardown(() => {
    sinon.restore();
  });

  test('openMapInWebview should throw an error if no valid latitude/longitude values are found', async () => {
    const selectedText = 'invalid text';
    const context = { subscriptions: [] } as unknown as vscode.ExtensionContext;

    try {
      await openMapInWebview(selectedText, context);
      assert.fail('Expected function to throw an error');
    } catch (err: any) {
      expect(err.message).to.exist;
    }
  });

  test('should create a webview panel with the correct arguments', async () => {
    const selectedText = '51.501476,-0.140634';
    const context = { subscriptions: [] } as unknown as vscode.ExtensionContext;

    await openMapInWebview(selectedText, context);

    expect(
      createWebviewPanelStub.calledWith(
        'openInMap',
        'Open in map',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      )
    ).to.be.true;

    assert(createWebviewPanelStub.calledOnce);
    assert(onDidDisposeStub.calledOnce);

    createWebviewPanelStub.restore();
  });
});
