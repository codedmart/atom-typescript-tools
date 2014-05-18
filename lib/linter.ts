/// <reference path='./globals.d.ts' />
var __extends = function (d, b) {
    for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } }
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

import Atom = require('atom');
var linterPath: string = atom.packages.getLoadedPackage('linter').path;
import typescriptToolsLink = require('./typescript-tools/typescript-tools-link');

var Linter: Linter = require(linterPath + '/lib/linter');
var LinterTsTools = (function (_super) {
    __extends(LinterTsTools, _super);
    function LinterTsTools(editor) {
        var _this = this;
        _super.call(this, editor);
        this.linterName = 'tsTools';
        this.editor = editor;
        typescriptToolsLink.onDiagnostics(function (messages) {
            if (_this.lastCallback) {
                _this.processMessages(messages, _this.lastCallback);
            }
        });
    }
    LinterTsTools.prototype.lintFile = function (filePath, callback) {
        this.lastCallback = callback;
        typescriptToolsLink.requestDiagnostics(this.editor.getUri());
    };

    LinterTsTools.prototype.processMessages = function (messages, callback) {
        var _this = this;
        messages = messages.map(function (message) {
            return {
                message: message.message,
                line: message.line + 1,
                range: new Atom.Range([message.line, message.start], [message.line, message.end]),
                linter: _this.linterName,
                level: 'error'
            };
        });

        callback(messages);
    };
    (<any>LinterTsTools).syntax = ['source.ts'];
    return LinterTsTools;
})(Linter);

export = LinterTsTools;
