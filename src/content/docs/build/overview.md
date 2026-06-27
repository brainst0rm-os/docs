---
title: Build on Brainstorm
description: Brainstorm is built entirely out of sandboxed apps over a shared object layer. This is how you build one.
sidebar:
  label: Overview
  order: 0
---

Brainstorm is a desktop shell that hosts **apps** — and nothing else. Notes, Database, Graph, Calendar, the whole product is apps running over one shared [object layer](/concepts/objects/). The same model is open to you: an app you build is a peer of the built-in ones, with the same access to vault data and the same place in the launcher.

This section is the developer hub for building those apps. It assumes you've read the [Concepts](/concepts/vaults/) — especially [Apps & permissions](/concepts/apps-and-permissions/) and [Objects](/concepts/objects/) — because the platform's guarantees *are* its API.

:::note
Brainstorm is in active development ahead of its public beta. App building today happens inside the shell source tree (see [Your first app](/build/your-first-app/)). A standalone published SDK and a third-party app-publishing pipeline are on the roadmap; these docs describe the app model and SDK as they exist now and will grow as that pipeline lands.
:::

## What an app is

An app is a small web app — HTML, JavaScript, CSS — that runs in its own sandboxed renderer. It ships with a [manifest](/build/the-manifest/) that declares who it is, what data types it owns, and which [capabilities](/build/capabilities/) it needs. The shell installs it, gives it a window, and brokers every request it makes to the system.

Three properties define the model:

- **Sandboxed.** An app can't reach the filesystem, the network, or another app on its own. It can only do what you've granted through the capability ledger. This is the security boundary — it's what makes it safe to run third-party apps, and later autonomous agents, over your most important data.
- **Capability-gated.** Every sensitive action maps to a named capability the app declared and you approved. Nothing is ambient; checks fail closed. See [Capabilities](/build/capabilities/).
- **Over shared objects.** Apps don't own private silos. They read and write typed [objects](/concepts/objects/) in the vault, so the note you write in one app is the same object another app can link to, show on a calendar, or place on a graph.

## What you build with

Every Brainstorm app is a **React app** built on one shared toolkit:

- **`@brainstorm/sdk`** — the component and helper library: menus, popovers, icons, pickers, property UI, search, find-and-replace, formatting, and the app-chrome theme. Check the [SDK & runtime](/build/the-sdk/) before writing anything; if a primitive exists, you import it rather than rebuild it.
- **`@brainstorm/react-yjs`** — the reactivity layer. Live entity lists and collaborative documents flow through hooks like `useVaultEntities` and `useYDoc`. You never hand-roll a change loop.
- **`window.brainstorm`** — the runtime the shell injects into every app: your identity, your granted capabilities, your launch context, and the [service namespaces](/build/the-sdk/#the-runtime) (`entities`, `files`, `intents`, `storage`, `search`, …) you call to do work.

## The shape of the work

A typical app is four things:

1. A **[manifest](/build/the-manifest/)** declaring the app, the object types it owns, and the capabilities it needs.
2. A **React UI** mounted into the app window, using the standard [header chrome](/build/the-sdk/#app-chrome) and SDK components.
3. **[Data access](/build/working-with-data/)** — reading and writing entities, syncing rich text through Yjs, storing app-private state.
4. **[Integration](/build/working-with-data/#talking-to-other-apps)** — registering as an opener for a type, dispatching intents, contributing widgets, so your app composes with the rest of the workspace instead of standing alone.

## Where to go next

- **[Your first app](/build/your-first-app/)** — scaffold, run, and see an app in the shell.
- **[The manifest](/build/the-manifest/)** — every field, with a real example.
- **[Capabilities](/build/capabilities/)** — the permission grammar and how to ask for access.
- **[SDK & runtime](/build/the-sdk/)** — the toolkit and the `window.brainstorm` surface.
- **[Working with data](/build/working-with-data/)** — entities, documents, storage, and cross-app integration.
- **[Recipes & anti-patterns](/build/recipes/)** — the patterns to copy and the mistakes to avoid.
