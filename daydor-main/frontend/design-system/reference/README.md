# Reference implementation

`bundle.js` / `bundle.css` / `index.d.ts` are the design system's reference components (plain React 18, `window.Daydor`). They define the look, states and props.

**Don't ship them as-is.** Build the real components in the app on shadcn/ui + Tailwind, matching these previews and the guidelines in `../components/<Name>/README.md`.

`previews/*.html` open directly in a browser (they load React 18.3.1 from jsDelivr). Change `data-theme` on `<html>` to `dark` or `client` to check other themes. The pages (Home, States, PayrollRun, Compliance, Onboarding, Person, Hiring, Leave, Expenses, Benefits, Phone, EmployeeApp, ExpenseClaim, Notifications) are full-screen layouts to copy.
