///<reference path='../globals.d.ts' />
import TypescriptTools = require('./typescript-tools');
import Atom = require('atom');
declare var __dirname;
var childProcess = new Atom.BufferedNodeProcess({
    command: __dirname + '/process.js',
    args: [],
    options: {
        stdio:['ipc']
    }
}).process;

childProcess.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

childProcess.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

childProcess.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

function subscribeMessage(message, callback) {
    childProcess.on('message', (m) => {
        m = JSON.parse(m);
        if (m.message === message) {
            callback(m.data);
        }
    });
}
tasd

function sendMessage(message, data) {
    childProcess.send(JSON.stringify({message: message, data: data}));
}


export function updateFileInfo(filename: string, content: string) {
    sendMessage('updateFileInfo', {filename: filename, content: content});
}

export function removeFileInfo(filename: string) {
    sendMessage('removeFileInfo', {filename: filename});
}

export function applyFormatterToContent(filename: string) {
    sendMessage('applyFormatterToContent', {filename: filename});
}

export function requestDiagnostics(filename) {
    sendMessage('requestDiagnostics', {filename: filename});
}

export function onDiagnostics(callback) {
    subscribeMessage('diagnostics', callback);
}

export function requestCompletions(filename: string, row: number, column: number, prefix: string) {
    sendMessage('requestCompletions', {filename: filename, row: row, column: column, prefix: prefix});
}

export function onCompletions(callback) {
    subscribeMessage('completions', callback);
}
