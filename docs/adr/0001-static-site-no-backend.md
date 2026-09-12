# Static site on GitHub Pages, no backend

The app is a static HTML/JS site hosted on GitHub Pages. Content files are edited on a
laptop and pushed to the repository; a **Kid**'s progress lives only in `localStorage` on
their own phone. A cloud backend (Firebase/Supabase) was considered and rejected: it would
have added accounts, sync and an operational surface that can fail at 8am before a
**School Test**, in exchange for conveniences this family does not need — each **Kid** has
their own phone, and parent editing on a laptop is acceptable.

## Consequences

- Progress cannot survive a lost phone or a cleared browser. An export/import of progress
  is the mitigation, and is deliberately deferred.
- Siblings cannot see each other's scores automatically. Sharing is manual (a share button
  producing text to send).
- There is no parent dashboard showing what the children actually did. The parent sees the
  content they authored, not the practice that followed.
