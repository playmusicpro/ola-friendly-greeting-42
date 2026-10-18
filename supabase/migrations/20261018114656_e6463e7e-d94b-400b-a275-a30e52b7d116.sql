REVOKE ALL ON public.admin_operations, public.admin_audit_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.admin_audit_logs FROM authenticated;
COMMENT ON TABLE public.admin_operations IS 'Admin-only operational state; authenticated discovery intentional, rows protected by is_admin RLS.';
COMMENT ON TABLE public.admin_audit_logs IS 'Admin-only immutable audit trail; authenticated discovery intentional, rows protected by is_admin RLS.';