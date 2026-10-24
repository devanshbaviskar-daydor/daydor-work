# VerifyCode

A one-time-code step for fraud-sensitive changes a person makes to their own record — above all, changing the salary bank account. Deliberately more than a confirm dialog.

**Consumer provides:** `title` ("Confirm your new bank account"), `destination` (masked phone number), `summary` (what will change — masked account, IFSC, when it takes effect), `value`/`onChange` or `defaultValue`, `onComplete(code)`, `error`, `resendIn` ("0:42") or `onResend`, `footer` (Confirm button with the lock, disabled until the code is complete; Cancel).
Optional `length` (default 6).

- Full screen on phones, never a small modal. The lock icon on `irreversible-soft` marks it as the loud moment.
- Show exactly what will change before the code boxes, masked: "ICICI ···· 0917".
- After success, notify the old phone number and email too ("We'll also tell you by email and on your current number").
- After 3 wrong codes, stop and route to HR; never let the person retry indefinitely.
- Supports paste and SMS autofill (`autocomplete="one-time-code"`).
