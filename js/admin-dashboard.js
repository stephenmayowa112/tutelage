
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
                const userHtml = users.map((user, idx) => `
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 py-2 border-b items-center" data-user-idx="${idx}">
                        <div>${user.first_name || ''} ${user.last_name || ''}</div>
                        <div>${user.email || ''}</div>
                        <div>
                            <select class="role-select bg-gray-100 border rounded px-2 py-1" data-user-idx="${idx}">
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                <option value="parent" ${user.role === 'parent' ? 'selected' : ''}>Parent</option>
                                <option value="tutor" ${user.role === 'tutor' ? 'selected' : ''}>Tutor</option>
                                <option value="school" ${user.role === 'school' ? 'selected' : ''}>School</option>
                            </select>
                        </div>
                        <div class="flex gap-2">
                            <button class="edit-btn bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded" data-user-idx="${idx}">Edit</button>
                            <button class="delete-btn bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded" data-user-idx="${idx}">Delete</button>
                        </div>
                    </div>
                `).join('');
                userList.innerHTML = userHtml;

                // Add event listeners for edit, delete, and role change
                users.forEach((user, idx) => {
                    // Edit button
                    userList.querySelector(`.edit-btn[data-user-idx='${idx}']`).addEventListener('click', () => {
                        const newFirstName = prompt('Edit First Name:', user.first_name || '');
                        const newLastName = prompt('Edit Last Name:', user.last_name || '');
                        const newEmail = prompt('Edit Email:', user.email || '');
                        if (newFirstName !== null && newLastName !== null && newEmail !== null) {
                            supabase.from('profiles').update({ first_name: newFirstName, last_name: newLastName, email: newEmail }).eq('email', user.email).then(() => location.reload());
                        }
                    });

                    // Delete button
                    userList.querySelector(`.delete-btn[data-user-idx='${idx}']`).addEventListener('click', () => {
                        if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
                            supabase.from('profiles').delete().eq('email', user.email).then(() => location.reload());
                        }
                    });

                    // Role select
                    userList.querySelector(`.role-select[data-user-idx='${idx}']`).addEventListener('change', (e) => {
                        const newRole = e.target.value;
                        supabase.from('profiles').update({ role: newRole }).eq('email', user.email).then(() => location.reload());
                    });
                });
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
