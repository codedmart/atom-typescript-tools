///<reference path="../node_modules/typescript-toolbox/typescript/tss.d.ts" />

interface IRequire {
    (library: string): any;
}

declare module 'atom' {

    class View {
        public static div: any;
        public static dl: any;
        public workspaceView: any;
    }

    module WorkspaceView {
        function prependToBottom(what): any;
        function getActivePaneItem(): any;
    }

    class Range {
        constructor(...any);
        public static fromPointWithDelta(...anything): any;
    }

    class BufferedNodeProcess {
        constructor(editor);
        public process: any;
    }
}

declare class Linter {
    constructor(...any);
    public editor: any;
}

declare module 'autocomplete-plus' {

    class Provider {
        constructor(...any);
        public editor: any;
        public editorView: any;
        public prefixOfSelection: any;
    }

    class Suggestion {
        constructor(...any);
    }
}

declare var atom;
