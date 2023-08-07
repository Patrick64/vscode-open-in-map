import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { expect } from 'chai';
import {
  openMapInWebview,
  getMapHtml,
  convertStrToMarkers,
} from '../../openMapInWebview';
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

  test('Convert string to lat/lngs', () => {
    const input = ' -5.1, -1.1  51.1, 9.1 \n -51.2, -9.33  ';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([
      ['-5.1', '-1.1'],
      ['51.1', '9.1'],
      ['-51.2', '-9.33'],
    ]);
  });

  test('Convert empty string to empty array', () => {
    const input = '';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([]);
  });

  test('Convert string with invalid format to empty array', () => {
    const input = 'abc, def ghi, jkl';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([]);
  });

  test('Convert string with mixed valid and invalid format to array of valid pairs', () => {
    const input = '50.123,-3.543 abc, def \n 51.123, -2.543 ghi, jkl';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([
      ['50.123', '-3.543'],
      ['51.123', '-2.543'],
    ]);
  });

  // Test case: check for proper handling of input with leading/trailing spaces and different number of spaces.
  test('Convert string to lat/lngs with leading/trailing/multiple spaces', () => {
    const input =
      '   50.123, -3.543   51.123,   -2.543  \n\n   52.68,   -1.9876   ';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([
      ['50.123', '-3.543'],
      ['51.123', '-2.543'],
      ['52.68', '-1.9876'],
    ]);
  });

  // Test case: check for proper handling of input with only one pair.
  test('Convert string to lat/lngs with one pair', () => {
    const input = '50.123,-3.543';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([['50.123', '-3.543']]);
  });

  // Test case: check for proper handling of empty input.
  test('Convert string to lat/lngs with empty string', () => {
    const input = '';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([]);
  });

  // Test case: check for proper handling of input with only spaces and newlines.
  test('Convert string to lat/lngs with only spaces and newlines', () => {
    const input = ' \n \n ';
    const result = convertStrToMarkers(input);
    expect(result).to.eql([]);
  });
});
