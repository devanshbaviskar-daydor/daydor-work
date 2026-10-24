# Payslip

The monthly payslip as an A4 document: company header, employee facts, earnings and deductions side by side, net pay in figures and in words.

**Consumer provides:** `company`, `address`, `period` ("October 2026 · paid 31 Oct"), `employee` (`{name, id, role, joined, pan, uan, bank, paidDays}` — PAN and bank masked), `earnings` and `deductions` (`[label, rupees]` pairs, in statutory order), optional `employer` (employer contributions shown as a note), `net` (else gross − deductions), `logo`, `theme` (the client's theme id).

- Payslips belong to the client company: their name, logo and accent on top; Daydor only as "Prepared with daydor" in the footer.
- Every amount shows paise (`₹62,500.00`); net pay also in words, Indian system ("Rupees One Lakh Eight Thousand Four Hundred Fifty Only") via `Daydor.amountInWords()`.
- Earnings in order: Basic, HRA, special allowance, other allowances. Deductions: Employee PF, ESI, Professional tax, TDS, other recoveries.
- Always renders on light paper, whatever the app theme. Prints to A4 with no extra chrome.
