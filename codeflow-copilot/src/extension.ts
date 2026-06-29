import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";

export function activate(context: vscode.ExtensionContext) {

    vscode.window.showInformationMessage(
        "🚀 CodeFlow Copilot Activated"
    );

    console.log("CodeFlow Copilot Activated");

    const provider = new SidebarProvider(
        context.extensionUri
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "codeflow.sidebar",
            provider
        )
    );
}

export function deactivate() {}