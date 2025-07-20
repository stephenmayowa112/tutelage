import { supabase } from './supabase-init.js';

const auditLogList = document.getElementById('audit-log-list');

async function fetchAuditLogs() {
    const { data, error } = await supabase
        .from('admin_audit_log')
        .select('admin_id, action, details, timestamp')
        .order('timestamp', { ascending: false });

    if (error) {
        auditLogList.innerHTML = '<p class="text-red-600">Failed to load audit logs.</p>';
        return;
    }

    if (!data || data.length === 0) {
        auditLogList.innerHTML = '<p class="text-gray-500">No audit log entries found.</p>';
        return;
    }

    auditLogList.innerHTML = data.map(log => `
        <div class="border-b py-2">
            <div><span class="font-bold">Admin ID:</span> ${log.admin_id}</div>
            <div><span class="font-bold">Action:</span> ${log.action}</div>
            <div><span class="font-bold">Details:</span> ${log.details}</div>
            <div><span class="font-bold">Timestamp:</span> ${new Date(log.timestamp).toLocaleString()}</div>
        </div>
    `).join('');
}

fetchAuditLogs();
