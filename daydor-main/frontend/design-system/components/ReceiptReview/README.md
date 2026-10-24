# ReceiptReview

A photographed receipt next to the fields Daydor read from it, for the person to check. A photo is not a generated document: it sits on a dark `photo-ground`, uncropped, and is never restyled.

**Consumer provides:** `fields` (`{label, value (number → Amount with paise), confidence?: 'low', flag?, confirmed?}`), and either `src` (the uploaded image) or `photo` (any node); optional `caption`, `heading`, `layout` (`side` default, `stacked` on phones), `children`.

- Extracted values are **drafts**: shown with a dashed underline until the employee confirms them, and the authoritative amount is always the one the person confirmed — never the model's reading.
- Low-confidence fields get a `warning-soft` row and a short reason ("One digit unclear"). Don't block submission on GSTIN; do block on amount and date.
- Approvers see the same component with every field confirmed, headed "confirmed by <name>".
