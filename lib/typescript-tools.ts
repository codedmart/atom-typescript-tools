///<reference path="./globals.d.ts" />
// The base class for linters.
// Subclasses must at a minimum define the attributes syntax, cmd, and regex.
class TypescriptTools {
    // The syntax that the linter handles. May be a string or
    // list/tuple of strings. Names should be all lowercase.

    public static syntax = "";

    // A string, list, tuple or callable that returns a string, list or tuple,
    // containing the command line (with arguments) used to lint.

    public cmd = "";

    // A regex pattern used to extract information from the executable's output.

    public regex = "";

    // current working directory, overridden in linters that need it

    public cwd = null;

    public defaultLevel = "error";

    public linterName = null;

    public executablePath = null;

    public getCmd(filePath) {
    }

    public lintFile(callback) {
        return this.processMessage(callback);
    }

    public processMessage(callback) {

        return callback('message');
    }
}

export = TypescriptTools;
