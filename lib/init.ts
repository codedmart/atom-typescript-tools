/// <reference path='./globals.d.ts' />

import TypescriptToolsView = require('./typescript-tools-view');
import StatusBarView = require('./statusbar-view');

var initialObject = {
    configDefaults: {
        lintOnSave: true,
        lintOnModified: true
    },
    // Activate the plugin
    activate: function() {
        return this.enable();

        // App = new App
    },
    enable: function() {
        this.enabled = true;
        this.statusBarView = new StatusBarView();

        // Subscribing to every current and future editor
        return this.editorViewSubscription = atom.workspaceView.eachEditorView((editorView) => {
            this.injectTypescriptToolsViewIntoEditorView(editorView, this.statusBarView);
            editorView.editor.on('grammar-changed', () => this.injectTypescriptToolsViewIntoEditorView(editorView, this.statusBarView));
        });
    },
    injectTypescriptToolsViewIntoEditorView: function(editorView, statusBarView) {
        if (editorView.editor.getGrammar().scopeName === 'source.ts' ) {
            new TypescriptToolsView(editorView, statusBarView);
        }
    }
};

export = initialObject;
