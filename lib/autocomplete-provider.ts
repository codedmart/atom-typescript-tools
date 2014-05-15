/// <reference path='./globals.d.ts' />

import Atom = require('atom');
import ac = require('autocomplete-plus');
var _ = require('underscore');

import TypescriptTools = require('./typescript-tools');

class PathsProvider extends ac.Provider {
    constructor(editor, public typescriptTools: TypescriptTools) {
        super(editor);
    }
    buildSuggestions() {
        var selection = this.editor.getSelection(),
            prefix = this.prefixOfSelection(selection);
        if (!prefix.length) {
            return;
        }

        var range = selection.getBufferRange();

        this.typescriptTools.updateFileInfo(this.editor.getUri(), this.editor.getText());
        var suggestions =  _.map(this.typescriptTools.getCompletions(
            this.editor.getUri(),
            range.start.row,
            range.start.column), () => {
            return new ac.Suggestion(this, {
                word: name,
                prefix: prefix,
                label: name,
                data: {
                    body: name
                }
            });
        });

        if (!suggestions.length) {
            return;
        }
        return suggestions;
    }


    confirm(suggestion) {
        var selection = this.editor.getSelection(),
            startPosition = selection.getBufferRange().start,
            buffer = this.editor.getBuffer(),
            // Replace the prefix with the body
            cursorPosition = this.editor.getCursorBufferPosition();

        buffer.delete(Atom.Range.fromPointWithDelta(cursorPosition, 0, -suggestion.prefix.length));
        this.editor.insertText(suggestion.data.body);

        // Move the cursor behind the body
        var suffixLength = suggestion.data.body.length - suggestion.prefix.length;
        this.editor.setSelectedBufferRange([startPosition, [startPosition.row, startPosition.column + suffixLength]]);

        setTimeout(() => this.editorView.trigger('autocomplete-plus:activate'), 100);

        return false; //Don't fall back to the default behavior
    }
}

export = PathsProvider;