const vscode = require("vscode");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('ConditionalLogger is now active!');

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

    //   if (selection.isEmpty) {
    //     vscode.window.showWarningMessage("Please select code with conditionals (if, else, switch).");
    //     return;
    //   }

      const selectedText = document.getText(selection);
      const startLine = selection.start.line;

      let ast;
      try {
        ast = parser.parse(selectedText, {
          sourceType: "module",
          plugins: ["jsx"]
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
            const insertLine = startLine + node.consequent.loc.start.line + 1;
            const logText = `console.log("Entered if block at line ${insertLine}");\n`;
            edits.push({ line: insertLine, text: logText });
          }

          // Insert log for `else` block (if it exists)
          if (node.alternate && node.alternate.loc) {
            const insertLine = startLine + node.alternate.loc.start.line + 1;
            const logText = `console.log("Entered else block at line ${insertLine}");\n`;
            edits.push({ line: insertLine, text: logText });
          }
        },

        SwitchStatement(path) {
          const node = path.node;
          const insertLine = startLine + node.loc.start.line + 1;
          const logText = `console.log("Entered switch block at line ${insertLine}");\n`;
          edits.push({ line: insertLine, text: logText });
        },

        SwitchCase(path) {
          const node = path.node;
          const insertLine = startLine + node.loc.start.line + 1;
          const caseLabel = node.test ? `case ${node.test.value}` : "default";
          const logText = `console.log("Entered ${caseLabel} block at line ${insertLine}");\n`;
          edits.push({ line: insertLine, text: logText });
        }
      });

      if (edits.length === 0) {
        vscode.window.showInformationMessage("No conditional blocks found in selected code.");
        return;
      }

      await editor.edit((editBuilder) => {
        for (let i = edits.length - 1; i >= 0; i--) {
          const { line, text } = edits[i];
          const position = new vscode.Position(line, 0);
          editBuilder.insert(position, text);
        }
      });

    //   vscode.window.showInformationMessage("Logs inserted into conditional blocks!");
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
