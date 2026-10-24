"""Postgres schema/ORM models.

Every table carries `tenant_id` from day one. Daydor runs as a single-tenant
managed service today (Daydor's own ops team operates it per design-partner
company), but the data layer is multi-tenant-ready in anticipation of a later
self-serve SaaS offering.
"""
