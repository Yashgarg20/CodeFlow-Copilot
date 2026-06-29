import * as vscode from "vscode";

export async function showResult(result: string) {
    const doc = await vscode.workspace.openTextDocument({
        content: result,
        language: "markdown"
    });

    vscode.window.showTextDocument(doc);
}