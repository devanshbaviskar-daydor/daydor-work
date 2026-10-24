"""Approval Gate domain.

Owns the timeout-escalation policy for any `ApprovalRequest` gate, across
every domain that opens one (payroll disbursal, statutory filing, headcount
threshold confirmation, offboarding F&F, DPDP consent). Not a data owner of
the gate itself - it drives `ApprovalRequest` rows that other domains create.
"""
