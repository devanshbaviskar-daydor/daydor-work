"""Offboarding domain.

Cross-domain conductor for the exit event. Not a data owner itself - it
coordinates access removal, asset return, and the final settlement
computation, then hands the approved F&F amount to Payroll & Compliance's
existing disbursement worker.
"""
