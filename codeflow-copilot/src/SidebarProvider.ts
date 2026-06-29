import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { explainError } from "./api";

export class SidebarProvider implements vscode.WebviewViewProvider {

    constructor(
        private readonly extensionUri: vscode.Uri
    ) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, "src", "webview")
            ]
        };

        const htmlPath = path.join(
            this.extensionUri.fsPath,
            "src",
            "webview",
            "index.html"
        );

        let html = fs.readFileSync(htmlPath, "utf8");

        const cssUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "src",
                "webview",
                "styles.css"
            )
        );

        const jsUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "src",
                "webview",
                "app.js"
            )
        );

        html = html.replace(
            "styles.css",
            cssUri.toString()
        );

        html = html.replace(
            "app.js",
            jsUri.toString()
        );

        webviewView.webview.html = html;

        webviewView.webview.onDidReceiveMessage(async (message) => {

            switch (message.command) {

                case "explain":

                    try {

                        const result = await explainError(message.text);

webviewView.webview.postMessage(
`Language: ${result.language}

Error Type: ${result.error_type}

Severity: ${result.severity}

Explanation:
${result.explanation}

Fix:
${result.fix}`
);

                    } catch (err: any) {

                        webviewView.webview.postMessage(
                            "Backend not running.\n\n" +
                            err.message
                        );

                    }

                    break;
            }

        });

    }

}