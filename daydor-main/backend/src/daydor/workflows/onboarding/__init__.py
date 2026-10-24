"""Onboarding domain.

Cross-domain conductor for the hire event. Not a data owner itself - it
coordinates Core HR record creation, triggers a Headcount Threshold Monitor
recheck, and registers the new employee for the next payroll cycle.
"""
