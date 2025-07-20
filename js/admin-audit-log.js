// Simple audit log utility for admin actions
// This should be called whenever an admin performs a sensitive action

export async function logAdminAction(supabase, adminId, action, details) {
    await supabase.from('admin_audit_log').insert({
        admin_id: adminId,
        action,
        details,
        timestamp: new Date().toISOString()
    });
}
