/// <reference path='./globals.d.ts' />

import TypescriptToolsView = require('./typescript-tools-view');

import typescriptToolsLink = require('./typescript-tools/typescript-tools-link');
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

        /*return atom.packages.activatePackage('autocomplete-plus').then((pkg) =>  {
            this.autocomplete = pkg.mainModule;
        });*/
    },
    registerAutoCompleteProviders: function(editorView) {
        /*setTimeout( () => {
            var provider;
            if (editorView.attached && !editorView.mini) {
                provider = new AutocompleteProvider(editorView);
                this.autocomplete.registerProviderForEditorView(provider, editorView);
                return this.providers.push(provider);
            }
        }, 0);*/
    },
    enable: function() {
        this.enabled = true;

        // Subscribing to every current and future editor
        return this.editorViewSubscription = atom.workspaceView.eachEditorView((editorView) => {
            this.injectTypescriptToolsViewIntoEditorView(editorView);
            editorView.editor.on('grammar-changed', () => this.injectTypescriptToolsViewIntoEditorView(editorView));
        });
    },
    injectTypescriptToolsViewIntoEditorView: function(editorView) {
        if (editorView.editor.getGrammar().scopeName === 'source.ts') {
            this.registerAutoCompleteProviders(editorView);
            new TypescriptToolsView(editorView);
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
