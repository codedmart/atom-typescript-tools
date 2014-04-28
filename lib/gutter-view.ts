// Gutter view for the plugin

class GutterView {
    public editorView;
    public gutter;

    // Instantiation

    constructor(editorView) {
        this.editorView = editorView;
        this.gutter = this.editorView.gutter;
    }

    public clear() {
        this.gutter.removeClassFromAllLines("typescript-tools-error");
        return this.gutter.removeClassFromAllLines("typescript-tools-warning");
    }

    public render(messages) {
        if (!this.gutter.isVisible()) {
            return;
        }

        return messages.map((message) => {
            if (message.level === "error") {
                this.gutter.addClassToLine(message.line - 1, "typescript-tools-error");
            }

            if (message.level === "warning") {
                return this.gutter.addClassToLine(message.line - 1, "typescript-tools-warning");
            }
        });
    }
}

export = GutterView;
