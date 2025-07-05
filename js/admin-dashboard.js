import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// These should be in supabase-init.js, but are here for clarity
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        // If no session, redirect to login
        window.location.href = 'login.html'; // We will create this page next
        return;
    }

    // Fetch user profile to check role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (profileError || profile.role !== 'admin') {
        // If not an admin, deny access
        document.body.innerHTML = '<div class="text-center py-20"><h1 class="text-2xl font-bold">Access Denied</h1><p>You do not have permission to view this page.</p></div>';
        return;
    }

    // Fetch all users if the user is an admin
    const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, role');

    // Hide loading state
    loadingState.classList.add('hidden');

    if (usersError) {
        console.error('Error fetching users:', usersError);
        errorState.classList.remove('hidden');
    } else {
        adminContent.classList.remove('hidden');
        if (users.length === 0) {
            userList.innerHTML = '<p class="text-gray-500">No users found.</p>';
        } else {
            const userHtml = users.map(user => `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-b">
                    <div>${user.first_name || ''} ${user.last_name || ''}</div>
                    <div>${user.email}</div>
                    <div>${user.role}</div>
                </div>
            `).join('');
            userList.innerHTML = userHtml;
        }
    }

    // Handle logout
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
});
