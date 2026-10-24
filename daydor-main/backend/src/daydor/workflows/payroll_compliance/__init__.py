"""Payroll & Statutory Compliance domain.

Split into two sub-orchestrators because they fail differently: a wage
calculation error is caught before disbursal, while a missed filing
deadline is a penalty that has already happened by the time it's noticed.

- payroll: wage calculation and salary disbursal.
- compliance: statutory filings, threshold-driven registrations.
"""
