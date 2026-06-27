---
title: Working with data
description: Read and write objects, sync collaborative documents, store app-private state, and integrate with other apps through intents.
sidebar:
  label: Working with data
  order: 5
---

An app's real work is data: reading and writing [objects](/concepts/objects/), syncing the documents behind them, keeping a little private state, and handing work to other apps. Brainstorm gives you four distinct stores, each for a different job — using the right one is most of getting data handling right.

| Use | For |
| --- | --- |
| **Entities** | Shared, typed, synced objects — your app's real content. |
| **Documents (Yjs)** | The collaborative body of an object — rich text, structured fields edited live. |
| **Storage** | App-private key/value state and uploaded files. |
| **Settings** | Per-device UI state that should *not* sync (last-opened tab, panel widths). |

## Objects: the entities service

Objects are typed records in the vault. Create, read, update, delete, and query them through `services.entities`:

```ts
const bs = window.brainstorm;

// create — returns the new object
const note = await bs.services.entities.create(
  "io.brainstorm.notes/Note/v1",
  { title: "Untitled", body: "", createdAt: Date.now(), updatedAt: Date.now() },
);

// read / update / delete by id
const fetched = await bs.services.entities.get(note.id);
await bs.services.entities.update(note.id, { title: "Renamed" });
await bs.services.entities.delete(note.id);

// query — by type, predicate, text, with a limit
const recent = await bs.services.entities.query({
  type: "io.brainstorm.notes/Note/v1",
  limit: 50,
});
```

Each of these is gated by the matching [capability](/build/capabilities/): `entities.read:<type>` to read, `entities.write:<type>` to create, update, or delete.

For anything that renders a list, prefer the **live** hook over one-shot `query` — it subscribes so the UI updates when objects change anywhere:

```tsx
import { useVaultEntities } from "@brainstorm/react-yjs";

const { entities } = useVaultEntities(window.brainstorm.services.vaultEntities);
const notes = entities.filter((e) => e.type === "io.brainstorm.notes/Note/v1");
```

## Documents: collaborative bodies

An object's *body* — rich text, or any field edited live and synced across devices and collaborators — lives in a Yjs document. Read and edit it through `@brainstorm/react-yjs` rather than the low-level sync calls:

```tsx
import { useYDoc, useYMap, useYText } from "@brainstorm/react-yjs";

const doc = useYDoc(noteId);          // the object's collaborative doc
const props = useYMap(doc, "properties");  // structured fields
const body = useYText(doc, "body");        // rich-text body
```

Edits made here merge cleanly with edits from other devices and users — that's the CRDT layer doing its job. You mutate the shared types; the changes propagate. (The runtime exposes lower-level `entities.loadDoc` / `applyDoc` for advanced cases, but most apps never touch them.)

## App-private storage

For state that's yours alone — caches, drafts, app preferences that *should* travel with the vault — use `services.storage`, gated by the default-granted `storage.kv`:

```ts
await bs.services.storage.put("draft:" + id, text);
const draft = await bs.services.storage.get("draft:" + id);
const keys = await bs.services.storage.list("draft:");
await bs.services.storage.delete("draft:" + id);
```

To bring a file into the vault's content-addressed store and get a URL back:

```ts
const { url } = await bs.services.storage.uploadFile(name, bytes, mime);
```

## Per-device settings

State that should **not** sync — which tab was open, a panel's width on this screen — goes in `services.settings`, not storage:

```ts
await bs.services.settings.put("sidebar.width", 280);
const width = await bs.services.settings.get("sidebar.width");
```

The distinction matters: put device-local view state in `settings` and it won't fight across machines; put real content there and it won't follow the user. When unsure, ask "should this be the same on my laptop and my phone?" — yes means an entity or storage, no means settings.

## Files

Your app never sees filesystem paths. It asks the user to pick a file (or a save target), gets an opaque handle, and reads or writes through it:

```ts
const handle = await bs.services.files.requestOpen({ mime: ["text/plain"] });
const bytes = await bs.services.files.read(handle);
// …
await bs.services.files.write(handle, newBytes);
```

Picking requires a user gesture; writing requires `files.write`. When your app is launched *as an opener* for a file (via a manifest [opener](/build/the-manifest/#registrations--plugging-into-the-shell)), the file arrives in your `launch` context.

## Talking to other apps

Apps compose through **intents** — structured requests dispatched by verb, handled by whichever app registered for it. Your app dispatches without knowing or naming the handler:

```ts
await bs.services.intents.dispatch({
  verb: "open",
  payload: { entityId: someId },
  source: bs.app.id,
});
```

Dispatching `open` is default-granted; other verbs are gated by `intents.dispatch:<verb>`. To *receive* intents, register a handler in your [manifest](/build/the-manifest/#registrations--plugging-into-the-shell) and listen:

```ts
bs.on("intent", (intent) => {
  if (intent.verb === "open") openObject(intent.payload.entityId);
});
```

This is how the whole workspace stays connected: a note links to a task, clicking it dispatches `open`, and Tasks handles it — no app hard-codes another.

## Next

- [Recipes & anti-patterns](/build/recipes/) — patterns to copy and mistakes to avoid.
- [SDK & runtime](/build/the-sdk/) — the full service surface and component library.
