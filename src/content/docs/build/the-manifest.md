---
title: The manifest
description: Every app ships a manifest declaring its identity, the object types it owns, the capabilities it needs, and how it registers with the shell.
sidebar:
  label: The manifest
  order: 2
---

Every app ships a `manifest.json`. It's the app's contract with the shell: who the app is, what object types it owns, which [capabilities](/build/capabilities/) it needs, and how it plugs into the rest of the system (as an opener for a type, a widget on the dashboard, a handler for an intent). The shell reads it at install time and again on every launch.

## A real manifest

This is the **Notes** app — the first-party reference app — trimmed for readability:

```json
{
  "id": "io.brainstorm.notes",
  "name": "Notes",
  "version": "0.1.0",
  "sdk": "1",
  "description": "Plain-text notes — the reference app demonstrating the full stack.",
  "icon": "icon.svg",
  "entry": "dist/index.html",
  "capabilities": [
    "storage.kv",
    "properties.read",
    "properties.write",
    "entities.read:io.brainstorm.notes/Note/v1",
    "entities.write:io.brainstorm.notes/Note/v1",
    "intents.dispatch:open",
    "files.write",
    "sharing.share"
  ],
  "registrations": {
    "entityTypes": [
      {
        "id": "io.brainstorm.notes/Note/v1",
        "schema": {
          "type": "object",
          "required": ["id", "title", "body", "createdAt", "updatedAt"],
          "properties": {
            "id": { "type": "string" },
            "title": { "type": "string" },
            "body": { "type": "string" },
            "createdAt": { "type": "number" },
            "updatedAt": { "type": "number" }
          }
        }
      }
    ],
    "openers": [
      { "kind": "primary", "entityType": "io.brainstorm.notes/Note/v1" },
      { "kind": "secondary", "mime": "text/plain" },
      { "kind": "secondary", "mime": "text/markdown" }
    ],
    "intents": [
      { "verb": "open", "entityType": "io.brainstorm.notes/Note/v1", "priority": "primary" },
      { "verb": "compose", "entityType": "io.brainstorm.notes/Note/v1", "priority": "primary" }
    ],
    "widgets": [
      { "id": "recent-notes", "name": "Recent Notes", "size": "medium" }
    ]
  }
}
```

## Identity fields

| Field | Required | What it is |
| --- | --- | --- |
| `id` | yes | Globally unique reverse-DNS id, e.g. `io.brainstorm.notes`. Used everywhere the app is referenced. |
| `name` | yes | Display name shown in the launcher and window. |
| `version` | yes | The app's own semver. |
| `sdk` | yes | The SDK API version the app targets (a string, e.g. `"1"`). |
| `entry` | yes | Path to the HTML entry document, relative to the app root — typically `dist/index.html`. |
| `description` | no | One-line description for the launcher and listings. |
| `icon` | no | Path to the app icon (SVG), relative to the app root. |

## Object types you own

Entity-type ids follow `<appId>/<Type>/<version>`, e.g. `io.brainstorm.notes/Note/v1`. Declaring a type under `registrations.entityTypes` tells the vault this type exists and gives it a JSON Schema:

```json
"entityTypes": [
  {
    "id": "io.brainstorm.notes/Note/v1",
    "schemaUrl": "https://brainstorm.io/schemas/notes/note/v1.json",
    "schema": { "type": "object", "required": ["id"], "properties": { } }
  }
]
```

The `schema` validates the object's properties. The version suffix (`/v1`) is how you evolve a type without breaking objects already in vaults — a future `/v2` is a distinct type with its own schema. An app reads and writes its own types through `entities.write:<appId>/<Type>/<version>`; reading types it *doesn't* own needs the matching `entities.read` grant.

## Registrations — plugging into the shell

Everything under `registrations` is optional. Each block is how your app composes with the workspace rather than standing alone.

- **`openers`** — declares your app as a way to open something. `kind: "primary"` makes your app the default for an entity type; `kind: "secondary"` registers you as an alternative, and `mime` lets you open files of a MIME type. This is how double-clicking a note routes to Notes.
- **`intents`** — registers your app as a handler for a [verb](/build/working-with-data/#talking-to-other-apps) on a type (`open`, `compose`, `share`, …) with a `priority`. Other apps dispatch these intents without knowing your app exists.
- **`widgets`** — dashboard widgets your app contributes, each with an `id`, `name`, and `size` (`small`, `medium`, or `large`). Requires the `widgets.publish` capability.
- **`blocks`** — block-protocol contributions your app provides (e.g. an inline-task block), bound to the entity types they render. Requires `blocks.provide:<blockId>`.

Other manifest sections you'll encounter as the app grows include `shortcuts` (declared keyboard chords), `menus` (contributed menu items), `layouts` (how your type renders in a given context), and `i18n` (the source locale and translations). Add these as features need them — a minimal app declares only `entityTypes` and the capabilities it uses.

## Next

- [Capabilities](/build/capabilities/) — what each string in the `capabilities` array grants, and how to ask for more at runtime.
- [Working with data](/build/working-with-data/) — reading and writing the object types you declared here.
