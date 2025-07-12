# ConditionalLogger

**ConditionalLogger** is a lightweight VS Code extension that helps developers debug conditional logic more easily by automatically inserting `console.log()` statements inside:

- `if`
- `else`
- `else if`
- `switch`
- `case`
- `default` blocks

## ✨ Features

- Quickly debug logic flow
- Auto-inserts logs into selected conditional code
- Handles multi-line and nested conditionals using AST
- Adds line numbers to log messages
- Works on JavaScript and TypeScript

## 🧠 How to Use

1. Select a block of conditional code (e.g., `if`, `else`, `switch`).
2. Press `Alt+L`.
3. The extension will insert `console.log()` statements inside each conditional block.

### 🔧 Example

Before:

if (user.age > 18) {
  grantAccess();
} else {
  denyAccess();
}

After pressing Alt+L:

if (user.age > 18) {
  console.log("Entered if block at line 1");
  grantAccess();
} else {
  console.log("Entered else block at line 4");
  denyAccess();
}
