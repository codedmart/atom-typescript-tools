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
}

declare var atom;
