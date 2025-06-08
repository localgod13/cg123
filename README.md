## AI Assistant Usage

> The AI assistant should make changes directly. Don't ask for confirmation.

## File Naming and Import/Export Rule

**Always ensure that:**
- The file name on disk exactly matches the casing and spelling used in all import/export statements throughout the codebase.
- When creating, renaming, or importing files, use all-lowercase file names with no spaces (e.g., `level8.js`, not `Level8.js` or `Level 8.js`).
- If you move or rename a file, update all import statements everywhere in the project to match the new name and casing.
- Never have two files in the same directory whose names differ only by case (e.g., `level8.js` and `Level8.js`).

**Example:**
```js
// Correct:
import { runLevel8 } from './levels/level8.js';

// Incorrect (will cause errors on some systems):
import { runLevel8 } from './levels/Level8.js';
```

**Enforcement:**
- Before committing or running the project, do a quick search for all import statements and verify they match the actual file names on disk.
- If you use an editor or OS that is case-insensitive (like Windows), be extra careful, as these errors may only show up in some environments or build tools.
