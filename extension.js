const vscode = require("vscode");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("ConditionalLogger is now active!");

  const disposable = vscode.commands.registerCommand(
    "conditionallogger.ConditionalLogger",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const document = editor.document;
      const selection = editor.selection;
      const selectedText = document.getText(selection);
      const startLine = selection.start.line;

      let ast;
      try {
        ast = parser.parse(selectedText, {
          sourceType: "module",
          plugins: [
            "jsx", // for React/Vue templates
            "typescript", // for TypeScript support
            "classProperties", // for class field declarations
            "decorators-legacy", // for decorators used in Vue/TS
            "optionalChaining", // for ?. usage
            "nullishCoalescingOperator", // for ?? usage
          ],
        });
      } catch (err) {
        vscode.window.showErrorMessage("Failed to parse selected code.");
        console.error(err);
        return;
      }

      const edits = [];

      traverse(ast, {
        IfStatement(path) {
          const node = path.node;

          // Insert log for `if` block
          if (node.consequent && node.consequent.loc) {
            const insertLine = startLine + node.consequent.loc.start.line;
            const logText = `console.log("Entered if block at line ${insertLine}");\n`;
            edits.push({ line: insertLine, text: logText });
          }

          // ✅ Insert log only if it's a true `else`, not `else if`
          if (
            node.alternate &&
            node.alternate.loc &&
            node.alternate.type !== "IfStatement"
          ) {
            const insertLine = startLine + node.alternate.loc.start.line;
            const logText = `console.log("Entered else block at line ${insertLine}");\n`;
            edits.push({ line: insertLine, text: logText });
          }
        },

        SwitchStatement(path) {
          const node = path.node;
          const insertLine = startLine + node.loc.start.line;
          const logText = `console.log("Entered switch block at line ${insertLine}");\n`;
          edits.push({ line: insertLine, text: logText });
        },

        SwitchCase(path) {
          const node = path.node;
          const insertLine = startLine + node.loc.start.line;
          const caseLabel = node.test ? `case ${node.test.value}` : "default";
          const logText = `console.log("Entered ${caseLabel} block at line ${insertLine}");\n`;
          edits.push({ line: insertLine, text: logText });
        },
      });

      if (edits.length === 0) {
        vscode.window.showInformationMessage(
          "No conditional blocks found in selected code."
        );
        return;
      }

      await editor.edit((editBuilder) => {
        for (let i = edits.length - 1; i >= 0; i--) {
          const { line, text } = edits[i];
          const position = new vscode.Position(line, 0);
          editBuilder.insert(position, text);
        }
      });

      vscode.window.showInformationMessage(
        "Logs inserted into conditional blocks!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
