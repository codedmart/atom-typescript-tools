///<reference path='./globals.d.ts' />
// The base class for linters.
// Subclasses must at a minimum define the attributes syntax, cmd, and regex.

declare var __dirname;
import TypeScript = require('../node_modules/typescript-toolbox/typescript/tss');
import Harness = require('./typescript-harness');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var fuzzaldrin = require('fuzzaldrin');

function loadFile(root, file) {
    var filename = file.path.indexOf('/') === 0 ? file : path.resolve(root, file.path);
    if (filename.indexOf('.ts') !== filename.length - 3 && filename.indexOf('.js') !== filename.length - 3) {
        if (fs.existsSync(filename + '.ts')) {
            filename += '.ts';
        } else if (fs.existsSync(filename + '.js')) {
            filename += '.js';
        } else {
            return;
        }
    }
    return { filename: filename, content: fs.readFileSync(filename, { encoding: 'utf8' }) };
}

class TypescriptTools {
    private languageServiceHost;
    private languageService;
    private formatCodeOptions;
    private languageServiceCompiler;
    private coreService;

    constructor() {
        this.languageServiceHost = new Harness.LanguageServiceHostImpl();
        this.languageService = new TypeScript.Services.LanguageService(this.languageServiceHost);
        this.languageServiceCompiler = new TypeScript.Services.LanguageServiceCompiler(this.languageServiceHost);
        this.coreService = new TypeScript.Services.CoreServices(new Harness.CoreServiceHostImpl());
        this.formatCodeOptions = this.createDefaultFormatCodeOptions();
        var globals = path.resolve(__dirname, '../node_modules/typescript/bin/lib.d.ts');
        this.addFileInfo(
            globals,
            fs.readFileSync(globals, { encoding: 'utf8' })
            );
    }

    createDefaultFormatCodeOptions() {
        return new TypeScript.Services.FormatCodeOptions();
    }


    updateFileInfo(filename: string, content: string) {
        var filesToLoad: any[] = [{ filename: filename, content: content }],
            filesLoaded: string[] = [],
            fileToLoad: any;

        while (fileToLoad = filesToLoad.pop()) {
            if (filesLoaded.indexOf(fileToLoad.filename) === -1) {
                filesLoaded.push(fileToLoad.filename);
                this.addFileInfo(fileToLoad.filename, fileToLoad.content);

                var pfi = this.coreService.getPreProcessedFileInfo(
                    fileToLoad.filename,
                    this.languageServiceHost.getScriptSnapshot(fileToLoad.filename)
                    );
                filesToLoad = filesToLoad.concat(_.map(pfi.importedFiles, _.partial(loadFile, path.dirname(fileToLoad.filename))));
                filesToLoad = filesToLoad.concat(_.map(pfi.referencedFiles, _.partial(loadFile, path.dirname(fileToLoad.filename))));
                filesToLoad = _.compact(filesToLoad);
            }
        }

    }

    addFileInfo(filename, content) {
        var file = this.languageServiceHost.getFile(filename),
            version = file ? file.version : 0;
        if (file && file.snapshot.getText(0, file.snapshot.getLength()) !== content) {
            version = version + 1;
        }
        this.languageServiceHost.addFile({
            fileName: filename,
            version: version,
            open: false,
            byteOrderMark: TypeScript.ByteOrderMark.None,
            snapshot: TypeScript.ScriptSnapshot.fromString(content)
        });
    }

    removeFileInfo(filename) {
        this.languageServiceHost.removeFile(filename);
    }

    applyFormatterToContent(filename: string): string {
        var snapshot = this.languageServiceHost.getScriptSnapshot(filename);
        var textEdits = this.languageService.getFormattingEditsForRange(
            filename,
            0,
            snapshot.getLength(),
            this.formatCodeOptions);

        return this.applyTextEdit(snapshot.getText(0, snapshot.getLength()), textEdits);
    }

    getCompletions(filename: string, row: number, column: number, prefix: string) {
        var snapshot = this.languageServiceHost.getScriptSnapshot(filename);
        var position = snapshot.getLineStartPositions()[row] + column;
        var completions = this.languageService.getCompletionsAtPosition(filename, position, true);
        completions = completions ? completions.entries : [];
        if (prefix.length) {
            completions = fuzzaldrin.filter(completions, prefix, {key: 'name'});
        }
        completions = _.map(completions, (completion) => {
            return this.languageService.getCompletionEntryDetails(filename, position, completion.name);
        });
        return _.compact(completions);
    }

    getDiagnostics(filename: string): string {
        var syntactic = this.languageService.getSyntacticDiagnostics(filename);
        var semantic = this.languageService.getSemanticDiagnostics(filename);
        return _.reduce(semantic.concat(syntactic), (memo, diagnostic) => {
            var message = {
                message: diagnostic.message(),
                line: diagnostic.line() + 1,
                level: 'error'
            };
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
