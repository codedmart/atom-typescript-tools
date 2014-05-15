/// <reference path='./globals.d.ts' />

import TypescriptToolsView = require('./typescript-tools-view');
import StatusBarView = require('./statusbar-view');

import TypescriptTools = require('./typescript-tools');
import AutocompleteProvider = require('./autocomplete-provider');

var _ = require('underscore');

var initialObject = {
    providers: [],
    configDefaults: {
        lintOnSave: true,
        lintOnModified: true
    },
    // Activate the plugin
    activate: function() {
        this.enable();

        return atom.packages.activatePackage('autocomplete-plus').then((pkg) =>  {
            this.autocomplete = pkg.mainModule;
        });
    },
    registerAutoCompleteProviders: function(editorView, tstools) {
        setTimeout( () => {
            var provider;
            if (editorView.attached && !editorView.mini) {
                provider = new AutocompleteProvider(editorView, tstools);
                this.autocomplete.registerProviderForEditorView(provider, editorView);
                return this.providers.push(provider);
            }
        }, 0);
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
        if (editorView.editor.getGrammar().scopeName === 'source.ts') {
            var tstools = new TypescriptTools();
            this.registerAutoCompleteProviders(editorView, tstools);
            new TypescriptToolsView(editorView, statusBarView, tstools);
        }
    },

    deactivate: function() {
        if (this.editorViewSubscription) {
            this.editorViewSubscription.off();
        }

        _.each(this.providers, (provider) => this.autocomplete.unregisterProvider(provider));

        this.providers = [];
    }
};

export = initialObject;
