---
title: Capabilities
description: Apps declare the narrow permissions they need; the shell grants, prompts, or denies. Nothing is ambient and checks fail closed.
sidebar:
  label: Capabilities
  order: 3
---

A Brainstorm app starts with almost no power. It can render its own window and read and write its own storage — that's it. Everything else — reading other object types, reaching the network, posting a notification, signing a payload — is a named **capability** the app declares and the user grants. This is the same model described in [Apps & permissions](/concepts/apps-and-permissions/), seen from the builder's side.

Two invariants shape how you write apps:

- **Nothing is ambient.** There's no "let the app do anything." Every sensitive action maps to a capability granted for a reason.
- **It fails closed.** If a capability check can't be satisfied — or anything goes wrong evaluating it — the action is denied, never silently allowed.

## The grammar

A capability is `<service>.<verb>` with an optional `:<scope>`:

```
storage.kv                                    # own key/value store
entities.read:io.brainstorm.notes/Note/v1     # read one entity type
entities.write:io.brainstorm.notes/Note/v1    # write one entity type
entities.read:*                               # read ALL entity types (heavily prompted)
files.write                                   # write file handles the user picks
network.connect:wss://sync.example.com        # connect to one host
network.connect:*                             # broad network (heavily prompted)
intents.dispatch:open                         # dispatch open intents
notifications.post                            # post a notification
```

The scope is what keeps grants meaningful. Asking for `entities.read:io.brainstorm.tasks/Task/v1` is a request a user can reason about; asking for `entities.read:*` is asking to read their entire vault, and the prompt says so. **Request the narrowest scope that does the job** — broad scopes are heavily prompted and erode trust.

## Declaring them

List the capabilities your app needs in the manifest. The user reviews them at install:

```json
"capabilities": [
  "storage.kv",
  "entities.read:io.brainstorm.tasks/Task/v1",
  "entities.write:io.brainstorm.tasks/Task/v1",
  "notifications.post"
]
```

The granted set is also available to the app at runtime:

```ts
const granted = window.brainstorm.capabilities;   // string[]
if (granted.includes("notifications.post")) {
  // safe to call the notify path
}
```

## Requesting at runtime

Capabilities you don't need up front are better requested when the feature is first used, with a reason the user sees in the prompt:

```ts
await window.brainstorm.services.capabilities.request(
  "network.connect:wss://sync.example.com",
  "to sync your board with the team relay",
);
```

A clear, specific reason is the difference between a grant and a denial. Ask in context — at the moment the user clicks the thing that needs it — not on launch.

## The grant model

Capabilities fall into three bands:

- **Default-grant** — given without a prompt because they carry no cross-app or system risk: `storage.kv` (your own keyspace), dispatching `open` intents, and rendering your own window. You can rely on these existing.
- **Prompt-grant** — the common case: the user is asked, at install or at first use, and can grant, deny, or scope the grant. Most `entities.*`, `files.*`, `network.*`, and `notifications.post` live here.
- **Never-grant to sandboxed apps** — privileged, shell-internal capabilities a third-party app cannot hold at all.

Grants are recorded **per vault**, so an app trusted in your work vault has no standing in your personal vault. The user can revoke any grant at any time; revocation takes effect on the next host-service call.

## Degrade gracefully when denied

Because the user can deny or later revoke, **a denied capability is a normal runtime state, not a crash**. Service calls that hit a missing capability reject; catch and degrade:

```ts
try {
  const hits = await window.brainstorm.services.search.query("budget");
  render(hits);
} catch (err) {
  if (err.name === "CapabilityDenied") {
    showInlineHint("Grant search access to find across your vault.");
    return;
  }
  throw err;
}
```

Listen for changes so the UI tracks the live grant set:

```ts
window.brainstorm.on("capability-changed", (caps) => {
  // re-enable or hide features as grants change
});
```

An app that hides or disables what it can't currently do — rather than throwing — is one users trust enough to grant *more*.

## Next

- [SDK & runtime](/build/the-sdk/) — the services these capabilities gate.
- [Working with data](/build/working-with-data/) — the `entities`, `files`, and `intents` calls in practice.
