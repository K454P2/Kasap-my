# PasarKita

The source of a YeshBe app – version 1.0.0, exported 2026-11-08.

```
pages/          one file per page (pages/en/… – a translation)
components/     shared components – used by several pages (and the layout)
utils/          shared helpers – utils/navigation.js is the menu: its order and labels
layout.jsx      the frame around every page (header, menu, footer)
theme.css       colors, fonts, spacing
index.html      the HTML shell
data/           the data model – collections, fields, permissions
```

These files run on YeshBe: the engine, the SDK, sign-in and the data stay there, so this folder
doesn't run on its own. Keep it as a backup, review it, or use it as a reference.
