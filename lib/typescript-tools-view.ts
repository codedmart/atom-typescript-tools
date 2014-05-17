///<reference path='./globals.d.ts' />
import Atom = require('atom');

import typescriptToolsLink = require('./typescript-tools/typescript-tools-link');
var _ = require('underscore');

// The base class for linters.
// Subclasses must at a minimum define the attributes syntax, cmd, and regex.
class TypescriptToolsView {
    public editor;
    public editorView;
    public statusBarView;
    public refresh;
    public messages = [];

    // Instantiate the views
    //
    // editorView      The editor view

    constructor(editorView) {
        this.editor = editorView.editor;
        this.editorView = editorView;

        this.refresh = () => {
            typescriptToolsLink.updateFileInfo(this.editor.getUri(), this.editor.getText());
        };



        this.handleBufferEvents();

        typescriptToolsLink.updateFileInfo(this.editor.getUri(), this.editor.getText());

        this.editorView.command('atom-typescript-tools:format', () => {
            this.editor.setText(typescriptToolsLink.applyFormatterToContent(this.editor.getUri()));
        });

        this.refresh();
    }

    handleBufferEvents() {
        var buffer;
        buffer = this.editor.getBuffer();

        buffer.on('saved', (buffer) => {
            this.refresh();
        });

        buffer.on('destroyed', () => {

            typescriptToolsLink.removeFileInfo(this.editor.getUri());
            buffer.off('saved');

            return buffer.off('destroyed');
        });

        this.editor.on('contents-modified', () => {
            this.refresh();
        });
    }
}

export = TypescriptToolsView;
