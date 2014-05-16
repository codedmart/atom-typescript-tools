///<reference path='./globals.d.ts' />
import GutterView = require('./gutter-view');

import typescriptToolsLink = require('./typescript-tools/typescript-tools-link');
var _ = require('underscore');

// The base class for linters.
// Subclasses must at a minimum define the attributes syntax, cmd, and regex.
class TypescriptToolsView {
    public editor;
    public editorView;
    public gutterView;
    public statusBarView;
    public typescriptToolsLink;
    public refresh;
    public messages = [];

    // Instantiate the views
    //
    // editorView      The editor view

    constructor(editorView, statusBarView) {
        this.editor = editorView.editor;
        this.editorView = editorView;
        this.gutterView = new GutterView(editorView);
        this.statusBarView = statusBarView;

        this.refresh = () => {
            typescriptToolsLink.updateFileInfo(this.editor.getUri(), this.editor.getText());
            typescriptToolsLink.requestDiagnostics(this.editor.getUri())
        };

        typescriptToolsLink.onDiagnostics(this.processMessage.bind(this));
        atom.workspaceView.on('pane:active-item-changed', () => {
            this.statusBarView.hide();
            if (this.editor.id === atom.workspace.getActiveEditor().id) {
                return this.displayStatusBar();
            }
        });

        this.handleBufferEvents();

        typescriptToolsLink.updateFileInfo(this.editor.getUri(), this.editor.getText());
        this.editorView.command('atom-typescript-tools:format', () => {
            this.editor.setText(typescriptToolsLink.applyFormatterToContent(this.editor.getUri()));
        });

        this.editorView.on('editor:display-updated', () => this.gutterView.render(this.messages));

        this.editorView.on('cursor:moved', () => this.statusBarView.render(this.messages));

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

    processMessage(messages) {
        this.messages = messages;
        return this.display();
    }

    display() {
        this.displayGutterMarkers();
        return this.displayStatusBar();
    }

    displayGutterMarkers() {
        this.gutterView.clear();
        return this.gutterView.render(this.messages);
    }

    displayStatusBar() {
        return this.statusBarView.render(this.messages, this.editor);
    }
}

export = TypescriptToolsView;
