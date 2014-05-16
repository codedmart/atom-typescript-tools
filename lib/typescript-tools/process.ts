///<reference path='../globals.d.ts' />
import TypescriptTools = require('./typescript-tools');
declare var process;
var typescriptTools = new TypescriptTools();
function timeoutLoop() {
    //console.log('awake');
    setTimeout(timeoutLoop, 1000);
};
timeoutLoop();
function subscribeMessage(message, callback) {
    process.on('message', (m) => {
        m = JSON.parse(m);
        //console.log(m.message, '===', message);
        if (m.message === message) {
            //console.log('execute', m.data);
            callback(m.data);
        }
    });
}

function sendMessage(message, data) {
    process.send(JSON.stringify({message: message, data: data}));
}

subscribeMessage('updateFileInfo', (options) => typescriptTools.updateFileInfo(options.filename, options.content));

subscribeMessage('removeFileInfo', (options) => typescriptTools.removeFileInfo(options.filename));

subscribeMessage('applyFormatterToContent', (options) => typescriptTools.applyFormatterToContent(options.filename));

subscribeMessage('requestDiagnostics', (options) => {
    sendDiagnostics(typescriptTools.getDiagnostics(options.filename));
});

function sendDiagnostics(diagnostics) {
    sendMessage('diagnostics', diagnostics);
}

subscribeMessage('requestCompletions', (options) => {
    sendCompletions(typescriptTools.getCompletions(
        options.filename,
        options.row,
        options.column,
        options.prefix));
});


function sendCompletions(completions) {
    sendMessage('completions', completions);
}
