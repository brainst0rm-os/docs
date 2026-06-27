---
title: Recipes & anti-patterns
description: The patterns that keep an app consistent with the platform, and the mistakes that get rejected in review.
sidebar:
  label: Recipes & anti-patterns
  order: 6
---

Brainstorm apps share a small set of conventions. Following them is what makes a third-party app feel native rather than bolted on — same keyboard model, same theming, same accessibility, same data discipline. These are the patterns to copy and the mistakes that get caught in review.

## Patterns to copy

### Render lists from a live query

Anything that shows a list of objects should re-render when those objects change — anywhere, on any device. Drive it from the live hook:

```tsx
import { useVaultEntities } from "@brainstorm/react-yjs";

const { entities } = useVaultEntities(window.brainstorm.services.vaultEntities);
const items = entities.filter((e) => e.type === MY_TYPE);
```

### Ask for capabilities in context

Request a capability at the moment the feature is used, with a reason the user will see — not a wall of prompts on launch.

```ts
await bs.services.capabilities.request(
  "network.connect:wss://relay.example.com",
  "to sync your board with the team",
);
```

### Degrade when a grant is missing

A denied or revoked capability is a normal state. Catch it and hide or disable the feature rather than throwing.

```ts
try {
  render(await bs.services.search.query(q));
} catch (err) {
  if (err.name === "CapabilityDenied") return showHint("Grant search to use this.");
  throw err;
}
```

### Open the SDK before you build

Need a menu, popover, picker, icon, date formatter, property cell, or empty state? It's almost certainly in `@brainstorm/sdk`. Import it. See [SDK & runtime](/build/the-sdk/).

### Use the standard header

Every app uses the shared `.app-header` chrome with `app-header__title` on the title and the overflow `⋯` menu last in `app-header__right`. Don't restyle the header.

## Anti-patterns to avoid

### Don't hand-roll reactivity

The single most common mistake. Reading the change signal yourself re-implements the reactivity layer per app and drifts.

```ts
// ✗ rejected — per-app change loop
service.onChange(() => setItems(service.list()));

// ✓ the one reactivity stack
const { entities } = useVaultEntities(service);
```

This is enforced in the shell repo. All live state flows through `@brainstorm/react-yjs`.

### Don't build menus by hand

A `<div>`, a native `<select>`, or an absolutely-positioned list standing in for a menu loses the shared keyboard model, anchoring, theming, and accessibility.

```ts
// ✗ rejected — bespoke menu chrome / native select
// ✓ the shared runtime
import { openObjectMenu } from "@brainstorm/sdk/object-menu";
import { SelectMenu } from "@brainstorm/sdk/select-menu";
```

### Don't request broad scopes by default

`entities.read:*` asks to read the user's entire vault, and the prompt says so. Ask for the narrowest scope that does the job, e.g. `entities.read:io.brainstorm.tasks/Task/v1`. Broad scopes are heavily prompted and cost trust.

### Don't put content in per-device settings

`settings` is for device-local UI state (a panel width, the open tab) — it doesn't sync. Real content goes in entities; app-private content that should travel with the vault goes in `storage`. Mixing these up means data that silently won't follow the user, or device preferences that fight across machines. See [Working with data](/build/working-with-data/).

### Don't leave strings unwrapped

Every user-visible string goes through your app's translation function (`createT` from `@brainstorm/sdk/i18n`); plurals go through the shared `plural()` helper, never a `count === 1 ?` branch. Bare JSX text is rejected.

### Don't reach outside the sandbox

There's no ambient filesystem, network, or cross-app access. If you find yourself wanting a path or a direct call to another app, the answer is a capability and a service: `files` for files, `network` for the network, `intents` for other apps.

## Next

- [Overview](/build/overview/) — the model these conventions come from.
- [Concepts](/concepts/apps-and-permissions/) — the security and object model underneath.
