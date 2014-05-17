/// <reference path='./globals.d.ts' />
import Atom = require('atom');
var linterPath: string = atom.packages.getLoadedPackage('linter').path;
import typescriptToolsLink = require('./typescript-tools/typescript-tools-link');
var Linter: Linter = require(linterPath + '/lib/linter');
class LinterTsTools extends Linter {
    //The syntax that the linter handles. May be a string or
    //list/tuple of strings. Names should be all lowercase.
    public static syntax: string[] = ['source.ts'];

    linterName: string = 'tsTools';
    lastCallback: any;
    editor: any;

    constructor(editor) {
        super(editor);
        this.editor = editor;
        typescriptToolsLink.onDiagnostics((messages) => {
            
            if (this.lastCallback) {
                this.processMessages(messages, this.lastCallback);
            }
        });
    }

    lintFile(filePath: string, callback) {
        this.lastCallback = callback;
        typescriptToolsLink.requestDiagnostics(this.editor.getUri());
    }

    processMessages(messages, callback) {

        messages = messages.map((message) => {
            return { message: message.message,
                line: message.line + 1,
                range: new Atom.Range([message.line, message.start], [message.line, message.end]),
                linter: this.linterName,
                level: 'error'
            };
        });

        callback(messages);
    }
}

export = LinterTsTools;
