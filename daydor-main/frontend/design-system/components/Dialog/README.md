# Dialog

A modal for confirming one consequential action — above all, the final step of an irreversible approval. Becomes a bottom sheet on phones.

**Consumer provides:** `title` (the question: "File the October PF return?"), `description` (what Daydor will do), `footer` (buttons, primary last), `onClose`; optional `irreversible` (one sentence on what can't be undone — renders the lock strip and makes it an alertdialog), `children`, `size`, `open`, `inline`.

- Every irreversible DecisionCard approval passes through this dialog; nothing else should.
- On phones it is a bottom sheet, and the irreversible confirm button triggers device re-authentication: label it "Confirm with Face ID" (or the platform's equivalent).
- The primary button repeats the action with the lock icon ("File with EPFO"); the escape hatch is "Not yet", never "Cancel".
- In the app use shadcn `AlertDialog` (Radix) for focus management, styled with these classes.
