///<reference path='./globals.d.ts' />
// The base class for linters.
// Subclasses must at a minimum define the attributes syntax, cmd, and regex.
import TypeScript = require('../node_modules/typescript-toolbox/typescript/tss');
import Harness = require('./typescript-harness');
var _ = require('underscore');

function readFile(file) { return TypeScript.IO.readFile(file,null) }

class TypescriptTools {
    private languageServiceHost;
    private languageService;
    private formatCodeOptions;
    private languageServiceCompiler;

    constructor() {
        this.languageServiceHost = new Harness.LanguageServiceHostImpl();
        this.languageService = new TypeScript.Services.LanguageService(this.languageServiceHost);
        this.languageServiceCompiler = new TypeScript.Services.LanguageServiceCompiler(this.languageServiceHost);
        this.formatCodeOptions = this.createDefaultFormatCodeOptions();
    }

    createDefaultFormatCodeOptions() {
        return new TypeScript.Services.FormatCodeOptions();
    }


    updateFileInfo(filename: string, content: string) {
        var file = this.languageServiceHost.getFile(filename),
            version = file ? file.version + 1 : 0;
        this.languageServiceHost.addFile({
            fileName: filename,
            version: version,
            open: false,
            byteOrderMark: TypeScript.ByteOrderMark.None,
            snapshot: TypeScript.ScriptSnapshot.fromString(content)
        });
        console.log(this.languageServiceCompiler.fileNames());
        console.log('loading file', filename, content.length);
    }

    removeFileInfo(filename) {
        this.languageServiceHost.removeFile(filename);
    }

    applyFormatterToContent(filename: string): string {
        var snapshot = this.languageServiceHost.getScriptSnapshot(filename);
        console.log('formatting', filename, snapshot.getLength());
        var textEdits = this.languageService.getFormattingEditsForRange(
            filename,
            0,
            snapshot.getLength(),
            this.formatCodeOptions);

        return this.applyTextEdit(snapshot.getText(0, snapshot.getLength()), textEdits);
    }


    getDiagnostics(filename: string): string {
        console.log('get diagnostics', filename, this.languageService.getSemanticDiagnostics(filename));

        var syntactic = this.languageService.getSyntacticDiagnostics(filename);
        var semantic = this.languageService.getSemanticDiagnostics(filename);
        return _.reduce(syntactic.concat(semantic), (memo, diagnostic) => {
            var message = {
                message: diagnostic.message(),
                line: diagnostic.line() + 1,
                level: 'error'
            };
            console.log(message);
            memo.push(message);
            return memo;
        }, []);
    }

    applyTextEdit(content: string, textEdits: TypeScript.Services.TextEdit[]): string {
        for (var i = textEdits.length - 1; 0 <= i; i--) {
            var textEdit = textEdits[i];
            var b = content.substring(0, textEdit.minChar);
            var a = content.substring(textEdit.limChar);
            content = b + textEdit.text + a;
        }
        return content;
    }

}



export = TypescriptTools;
