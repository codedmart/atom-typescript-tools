///<reference path="./globals.d.ts" />
import Atom = require('atom');

// Status Bar View
class StatusBarView extends Atom.View {
    public hide;
    public violations;
    public show;

    public static content() {
        return this.div({
            "class": "tool-panel panel-bottom padded text-smaller"
        }, () => this.dl({
                "class": "typescript-tools-statusbar text-smaller",
                outlet: "violations"
            }));
    }

    // Render the view

    public render(messages, paneItem) {
        var currentLine, i, position;
        atom.workspaceView.prependToBottom(this);
        this.hide();
        if (!(messages.length > 0)) {
            return;
        }
        if (!paneItem) {
            paneItem = atom.workspaceView.getActivePaneItem();
        }
        currentLine = void 0;
        if (position = paneItem != null ? typeof paneItem.getCursorBufferPosition === "function" ? paneItem.getCursorBufferPosition() : void 0 : void 0) {
            currentLine = position.row + 1;
        }
        this.violations.empty();
        i = 0;
        return messages.map((item) => {
            if (parseInt(item.line) === currentLine && i <= 10) {
                this.violations.append("<dt><span class=\"highlight-" + item.level + "\">" + (item.typescriptTools) + "</span></dt><dd>" + item.message + "</dd>");
                this.show();
                return i++;
            }
        });
    }
}

export = StatusBarView;
