# JSON content files, authored through an editor page

**Word Lists** are stored as JSON, one file per **Kid**. A
plain-text format (`elephant - dramblys`, one per line) was considered and rejected. The
deciding factor was not authoring comfort — text wins there — but that an `editor.html`
page removes the only real advantage text had: JSON's punctuation. The editor loads an
existing file, edits it as a form, validates, and writes the file back out, so JSON syntax
is never typed by hand.

Validation belongs to the editor, not the app: two **Entries** sharing a **Lithuanian Side**
within a list, empty sides, and malformed dates. The editor also assigns and reassigns
**Stages**, since the parent moves words between them by hand.

## Consequences

- JSON remains directly hand-editable in an emergency, with standard tooling and editor support.
- Git diffs are noisier than a line-per-word text file would have been.
- The editor is now on the critical path for weekly authoring. If it breaks, authoring falls
  back to hand-editing JSON — usable, but the failure mode (an invisible missing comma) is
  the one this decision was meant to avoid.
