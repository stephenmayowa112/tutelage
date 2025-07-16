
import { supabase } from './supabase-init.js';

document.addEventListener('DOMContentLoaded', async () => {
    const userList = document.getElementById('user-list');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const adminContent = document.getElementById('admin-content');
    const logoutButton = document.getElementById('logout-button');

    // Show loading state
    loadingState.classList.remove('hidden');
    adminContent.classList.add('hidden');

    // Check user session

    let session;
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
            window.location.href = 'login.html';
            return;
        }
        session = data.session;
    } catch (err) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch user profile to check role

    let profile;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        if (error || !data || data.role !== 'admin') {
            document.body.innerHTML = '<div class="text-center py-20"><h1 class="text-2xl font-bold">Access Denied</h1><p>You do not have permission to view this page.</p></div>';
            return;
        }
        profile = data;
    } catch (err) {
        document.body.innerHTML = '<div class="text-center py-20"><h1 class="text-2xl font-bold">Access Denied</h1><p>You do not have permission to view this page.</p></div>';
        return;
    }

    // Fetch all users if the user is an admin

    try {
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, role');

        loadingState.classList.add('hidden');

        if (usersError) {
            console.error('Error fetching users:', usersError);
            errorState.classList.remove('hidden');
        } else {
            adminContent.classList.remove('hidden');
            if (!users || users.length === 0) {
                userList.innerHTML = '<p class="text-gray-500">No users found.</p>';
            } else {
                const userHtml = users.map(user => `
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-b">
                        <div>${user.first_name || ''} ${user.last_name || ''}</div>
                        <div>${user.email || ''}</div>
                        <div>${user.role || ''}</div>
                    </div>
                `).join('');
                userList.innerHTML = userHtml;
            }
        }
    } catch (err) {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }

    // Handle logout
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
});
