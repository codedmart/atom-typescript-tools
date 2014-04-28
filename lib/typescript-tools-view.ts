///<reference path="./globals.d.ts" />
var atom = require('atom');
var fs = require("fs");
var temp = require("temp");
import GutterView = require("./gutter-view");

temp.track();
// The base class for linters.
// Subclasses must at a minimum define the attributes syntax, cmd, and regex.
class TypescriptToolsView {
    public editor;
    public editorView;
    public gutterView;
    public statusBarView;

    public linters = [];

    public totalProcessed = 0;

    public tempFile = "";

    public messages = [];

    // Instantiate the views
    //
    // editorView      The editor view

    constructor(editorView, statusBarView) {
        this.editor = editorView.editor;
        this.editorView = editorView;
        this.gutterView = new GutterView(editorView);
        this.statusBarView = statusBarView;

        atom.workspaceView.on("pane:active-item-changed", () => {
            this.statusBarView.hide();
            if (this.editor.id === atom.workspace.getActiveEditor().id) {
                return this.dislayStatusBar();
            }
        });

        this.handleBufferEvents();

        this.editorView.on("editor:display-updated", () => this.gutterView.render(this.messages));

        this.editorView.on("cursor:moved", () => this.statusBarView.render(this.messages));

        this.lint();
    }

    public handleBufferEvents = () => {
        var buffer;
        buffer = this.editor.getBuffer();

        buffer.on("saved", (buffer) => {
            if (atom.config.get("linter.lintOnSave")) {
                if (buffer.previousModifiedStatus) {
                    console.log("linter: lintOnSave");
                    return this.lint();
                }
            }
        });

        buffer.on("destroyed", () => {
            buffer.off("saved");
            return buffer.off("destroyed");
        });

        return this.editor.on("contents-modified", () => {
            if (atom.config.get("linter.lintOnModified")) {
                console.log("linter: lintOnModified");
                return this.lint();
            }
        });
    }

    public lint() {
        console.log("linter: run commands");
        this.totalProcessed = 0;
        this.messages = [];
        this.gutterView.clear();
        if (this.linters.length > 0) {
            return temp.open("linter", (err, info) => {
                this.tempFile = info.path;
                return fs.write(info.fd, this.editor.getText(), () => fs.close(info.fd, (err) => this.linters.map((linter) => {
                            return linter.lintFile(info.path, this.processMessage);
                            // console.log 'stderr: ' + stderr
                            // if error is not null
                            //  console.log 'stderr: ' + error
                        })));
            });
        }
    }

    public processMessage = (messages) => {
        this.totalProcessed++;
        this.messages = this.messages.concat(messages);
        if (this.totalProcessed === this.linters.length) {
            fs.unlink(this.tempFile);
        }
        return this.dislay();
    }

    public dislay() {
        this.dislayGutterMarkers();
        return this.dislayStatusBar();
    }

    public dislayGutterMarkers() {
        return this.gutterView.render(this.messages);
    }

    public dislayStatusBar() {
        return this.statusBarView.render(this.messages, this.editor);
    }
}

export = TypescriptToolsView;
