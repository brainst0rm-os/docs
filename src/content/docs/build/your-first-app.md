---
title: Your first app
description: Scaffold a Brainstorm app, run it in the shell, and see a live list of your own objects.
sidebar:
  label: Your first app
  order: 1
---

This walkthrough scaffolds a working app, runs it in the shell, and shows it rendering a live list of objects from your vault. It takes about ten minutes.

:::note
Apps are currently built inside the Brainstorm shell source tree — the same place the first-party apps live. A standalone SDK package and a third-party publishing flow are on the roadmap; until then, "building an app" means working in the shell repo. The app model and SDK shown here are stable and carry forward unchanged.
:::

## Scaffold

From the shell repo, the scaffold generates a complete, compliant React app:

```sh
bun run new-app field-notes "Field Notes"
```

The first argument is the app id (kebab-case); the second is the display name. You get:

```
apps/field-notes/
├── manifest.json        # the app declaration
├── package.json         # deps: @brainstorm/sdk, @brainstorm/react-yjs, react
├── tsconfig.json
├── vite.config.ts
├── icon.svg             # generated from the app's initials
└── src/
    ├── index.html       # entry document (ships a strict Content-Security-Policy)
    ├── main.tsx         # React root mount
    ├── app.tsx          # your root component — a live entity list
    ├── runtime.ts       # type-safe accessor for window.brainstorm
    └── styles.css       # app styles, themed from the SDK
```

The scaffold is deliberately not a blank page — it mounts a real `useVaultEntities` list and the standard header chrome, so you start from a compliant app rather than retrofitting the conventions later.

## What the scaffold gives you

**`manifest.json`** declares the app and the one object type it owns:

```json
{
  "id": "io.brainstorm.field-notes",
  "name": "Field Notes",
  "version": "0.1.0",
  "sdk": "1",
  "entry": "dist/index.html",
  "icon": "icon.svg",
  "capabilities": [
    "storage.kv",
    "entities.read:*",
    "entities.write:io.brainstorm.field-notes/Item/v1"
  ],
  "registrations": {
    "entityTypes": [
      {
        "id": "io.brainstorm.field-notes/Item/v1",
        "schema": {
          "type": "object",
          "required": ["id", "title", "createdAt", "updatedAt"]
        }
      }
    ]
  }
}
```

See [The manifest](/build/the-manifest/) for every field and [Capabilities](/build/capabilities/) for what those capability strings mean.

**`src/main.tsx`** mounts React. Two imports are mandatory and come first — the app-theme stylesheet (which carries the shared `.app-header` chrome and theme tokens) and the menu host:

```tsx
import "@brainstorm/sdk/app-theme.css";
import { mountMenuHost } from "@brainstorm/sdk/menus";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FieldNotesApp } from "./app";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("field-notes: #root not found");
mountMenuHost();
createRoot(root).render(
  <StrictMode>
    <FieldNotesApp />
  </StrictMode>,
);
```

**`src/app.tsx`** is your UI. The scaffold renders a live, reactive list of your own object type:

```tsx
import { useVaultEntities } from "@brainstorm/react-yjs";
import { useMemo } from "react";
import { getBrainstorm } from "./runtime";

const APP_TYPE = "io.brainstorm.field-notes/Item/v1";

export function FieldNotesApp() {
  const service = getBrainstorm()?.services?.vaultEntities ?? null;
  const { entities } = useVaultEntities(service);
  const items = useMemo(
    () => entities.filter((e) => e.type === APP_TYPE),
    [entities],
  );

  return (
    <div className="app">
      <header className="app-header" data-testid="app-header">
        <div className="app-header__left">
          <h1 className="app-header__title">Field Notes</h1>
        </div>
        <div className="app-header__right" />
      </header>
      <main className="app-body">
        {items.length === 0 ? (
          <p>Nothing here yet.</p>
        ) : (
          <ul className="app-list">
            {items.map((item) => (
              <li key={item.id}>{String(item.properties.title ?? item.id)}</li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
```

The list is **live**: `useVaultEntities` subscribes to the vault, so when an object of this type is created or changed — by your app, another app, or another device — the list re-renders. You never write a manual `onChange → setState` loop; that's [the reactivity rule](/build/recipes/#use-the-reactivity-layer).

## Register and run

A new app is registered with the shell so the dev seeder installs it on launch (add it to the first-party app list, per the repo's contributor guide). Then:

```sh
bun run dev
```

The shell rebuilds and reinstalls first-party apps on boot, so a **full shell restart** is what deploys your changes — reloading a window serves the previous build. You'll see your app in the launcher; open it and it renders the (empty) list.

:::tip
Each app logs `[app:<id>] build <sha>` in its own DevTools console and the shell logs `[shell] launch … build <sha>`. If you think a change didn't take, check those shas match — a stale sha means the shell wasn't restarted.
:::

## Make it do something

Create an object of your type from the app, and watch the list update itself:

```tsx
const bs = getBrainstorm();
await bs.services.entities.create(APP_TYPE, {
  title: "First field note",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

No refresh, no refetch — the live query already subscribed to this type re-renders. From here:

- [Working with data](/build/working-with-data/) — querying, editing, rich text, and app-private storage.
- [SDK & runtime](/build/the-sdk/) — the components and services you build the rest of the UI from.
- [Recipes & anti-patterns](/build/recipes/) — the conventions that keep an app consistent with the platform.
