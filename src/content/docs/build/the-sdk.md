---
title: SDK & runtime
description: The shared component library you build apps from, and the window.brainstorm runtime the shell injects to broker every system call.
sidebar:
  label: SDK & runtime
  order: 4
---

You build a Brainstorm app from two things: the **SDK** (`@brainstorm/sdk` and `@brainstorm/react-yjs`), a shared library of components, hooks, and helpers; and the **runtime** (`window.brainstorm`), the object the shell injects into every app to broker system calls.

The rule that governs both: **check the SDK before you write anything.** If a menu, popover, picker, icon, formatter, or data hook exists, you import it. A hand-rolled copy drifts from the shared keyboard model, theming, and accessibility — and is rejected in review. Over-building is the most common new-app mistake.

## The runtime

`window.brainstorm` is available as soon as your app loads. It carries identity, context, and the service namespaces:

```ts
window.brainstorm.app            // { id, version, sdkVersion }
window.brainstorm.capabilities   // string[] of granted capabilities
window.brainstorm.launch         // why the app opened (reason, entityId?, file?, …)
window.brainstorm.locale         // BCP-47 tag
window.brainstorm.services.*     // the host services you call to do work
window.brainstorm.on(event, fn)  // lifecycle: ready, intent, capability-changed, suspend, resume, close
```

Every `services.*` call is marshalled into a structured IPC envelope, checked against your granted [capabilities](/build/capabilities/), and forwarded to a shell service. A call you lack the capability for rejects — it's never silently granted.

### Service namespaces

The services an app calls most:

| Service | What it does |
| --- | --- |
| `entities` | Create, read, update, delete, and query [objects](/concepts/objects/); load and sync their documents. |
| `vaultEntities` | A live snapshot of vault objects — the source behind the `useVaultEntities` hook. |
| `files` | Pick, read, write, and watch files the user chooses (no raw filesystem paths). |
| `storage` | Your app's private key/value store, plus content-addressed file upload. |
| `settings` | Per-device UI state — **not** synced across devices. |
| `intents` | Dispatch structured requests to other apps (`open`, `compose`, `share`, …). |
| `search` | Vault-wide full-text search (read-only). |
| `properties` | The property definitions for entity types. |
| `ui` | Notifications and system open/save dialogs. |
| `identity` | The local user, and signing (capability-gated). |
| `capabilities` | Check and request capabilities at runtime. |
| `theme` | React to theme changes; preview a theme. |

Others exist for richer apps — `blocks` and `bp` (Block Protocol), `network`, `dashboard`, `selection`, `dnd`, `sharing`, `ai`, `automations`, `webView`. See [Working with data](/build/working-with-data/) for the ones you'll use first.

## Reactivity: never hand-roll a change loop

Brainstorm objects are live — they change from other apps and other devices. Reactive state flows through **one** stack, `@brainstorm/react-yjs`:

```tsx
import { useVaultEntities, useYDoc, useYMap, useYText } from "@brainstorm/react-yjs";

// a live list of vault objects
const { entities } = useVaultEntities(window.brainstorm.services.vaultEntities);

// a collaborative document (rich text, structured body)
const doc = useYDoc(entityId);
const props = useYMap(doc, "properties");
const body = useYText(doc, "body");
```

Do **not** write `vaultEntities.onChange → list() → setState`. That re-implements the reactivity layer per app — the exact drift this stack exists to prevent. Read the live state through the hooks and let React render it. This is enforced in the shell repo; see [the anti-patterns](/build/recipes/#use-the-reactivity-layer).

## The component library

`@brainstorm/sdk` exports through subpaths. A sampling of what's there — read the catalog before building any of these yourself:

```ts
import "@brainstorm/sdk/app-theme.css";          // theme tokens + .app-header chrome (import first)
import { mountMenuHost } from "@brainstorm/sdk/menus";
import { Icon } from "@brainstorm/sdk/icon";
import { Popover } from "@brainstorm/sdk/popover";
import { SelectMenu } from "@brainstorm/sdk/select-menu";
import { Searchbar } from "@brainstorm/sdk/searchbar";
import { EmptyState } from "@brainstorm/sdk/empty-state";
import { Checkbox } from "@brainstorm/sdk/checkbox";
import { useShortcut } from "@brainstorm/sdk/shortcut";
import { createT } from "@brainstorm/sdk/i18n";
import { openObjectMenu } from "@brainstorm/sdk/object-menu";
import { createFindController } from "@brainstorm/sdk/find-replace";
```

There's much more — calendars and date formatters, property cells and panels, drag-and-drop, virtual lists, cover and icon pickers, export, navigation history. The principle holds: **if it exists in the SDK, import it.**

### Menus and dropdowns

Every menu, dropdown, context menu, and "pick one of N" popup goes through the shared menus runtime. Mount it once (`mountMenuHost()` in your entry) and open menus through the shared openers (`openObjectMenu`, `openAnchoredMenu`, `openContextMenu`). Enumerated choices use `@brainstorm/sdk/select-menu`, not a native `<select>`. A hand-built `<div>` standing in for a menu is rejected — it loses the shared keyboard model, anchoring, and accessibility.

## App chrome

The app theme stylesheet owns the header. Put this skeleton in every app and don't re-declare its CSS:

```tsx
<div className="app">
  <header className="app-header">
    <div className="app-header__left">
      <h1 className="app-header__title">My App</h1>
    </div>
    <div className="app-header__right">
      {/* content actions and panel toggles first; the object ⋯ menu LAST */}
    </div>
  </header>
  <main className="app-body">{/* your UI */}</main>
</div>
```

The header is a fixed-height glass bar with platform-correct padding (macOS traffic lights, Windows controls) applied for you. Put `app-header__title` on your title element — don't build your own title face. The overflow `⋯` menu, when you have one, is always the **last** element in `app-header__right`.

## Internationalization

Every user-visible string wraps in a translation call. Apps use the lightweight `createT` from `@brainstorm/sdk/i18n` (which does `{name}` interpolation only — no ICU). For plurals, use the shared `plural(t, count, "key.one", "key.other")` helper rather than a `count === 1 ?` branch in component code. Add new string ids to your app's catalog; never put bare text in JSX.

## Next

- [Working with data](/build/working-with-data/) — the `entities`, `storage`, `intents`, and document APIs in practice.
- [Recipes & anti-patterns](/build/recipes/) — the conventions that keep an app consistent with the platform.
