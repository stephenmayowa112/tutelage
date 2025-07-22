import { supabase } from './supabase-init.js';
import { logAdminAction } from './admin-audit-log.js';

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
            .select('first_name, last_name, email, role, suspended');

        loadingState.classList.add('hidden');

        if (usersError) {
            console.error('Error fetching users:', usersError);
            errorState.classList.remove('hidden');
        } else {
            adminContent.classList.remove('hidden');
            if (!users || users.length === 0) {
                userList.innerHTML = '<div class="text-center py-10"><p class="text-gray-500">No users found.</p></div>';
            } else {
                const userHtml = users.map((user, idx) => `
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 py-4 px-4 border-b items-center" data-user-idx="${idx}">
                        <div class="md:hidden">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="font-semibold text-gray-800 mb-2">${user.first_name || ''} ${user.last_name || ''}</div>
                                <div class="text-sm text-gray-600 mb-1"><span class="font-medium">Email:</span> ${user.email || ''}</div>
                                <div class="text-sm text-gray-600 mb-2"><span class="font-medium">Role:</span> ${user.role || 'N/A'}</div>
                                <div class="mb-3">
                                    <span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                                        ${user.suspended ? 'Suspended' : 'Active'}
                                    </span>
                                </div>
                                <div class="space-y-2">
                                    <select class="role-select w-full bg-gray-100 border rounded px-2 py-1 text-sm" data-user-idx="${idx}">
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                        <option value="parent" ${user.role === 'parent' ? 'selected' : ''}>Parent</option>
                                        <option value="tutor" ${user.role === 'tutor' ? 'selected' : ''}>Tutor</option>
                                        <option value="school" ${user.role === 'school' ? 'selected' : ''}>School</option>
                                    </select>
                                    <div class="flex gap-2 flex-wrap">
                                        <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">Edit</button>
                                        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">Delete</button>
                                        <button class="reset-btn bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">Reset</button>
                                        <button class="suspend-btn bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">${user.suspended ? 'Activate' : 'Suspend'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="hidden md:block font-medium">${user.first_name || ''} ${user.last_name || ''}</div>
                        <div class="hidden md:block text-sm text-gray-600 truncate">${user.email || ''}</div>
                        <div class="hidden md:block">
                            <select class="role-select bg-gray-100 border rounded px-2 py-1 text-sm" data-user-idx="${idx}">
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                <option value="parent" ${user.role === 'parent' ? 'selected' : ''}>Parent</option>
                                <option value="tutor" ${user.role === 'tutor' ? 'selected' : ''}>Tutor</option>
                                <option value="school" ${user.role === 'school' ? 'selected' : ''}>School</option>
                            </select>
                        </div>
                        <div class="hidden md:flex gap-1 flex-wrap">
                            <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">Edit</button>
                            <button class="delete-btn bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">Delete</button>
                            <button class="reset-btn bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">Reset</button>
                            <button class="suspend-btn bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded" data-user-idx="${idx}">${user.suspended ? 'Activate' : 'Suspend'}</button>
                        </div>
                        <div class="hidden md:block">
                            <span class="inline-block px-2 py-1 rounded-full text-xs font-medium ${user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                                ${user.suspended ? 'Suspended' : 'Active'}
                            </span>
                        </div>
                    </div>
                `).join('');
                userList.innerHTML = userHtml;

                // Add event listeners for edit, delete, and role change
                users.forEach((user, idx) => {
                    // Edit buttons (both mobile and desktop)
                    const editBtns = userList.querySelectorAll(`.edit-btn[data-user-idx='${idx}']`);
                    editBtns.forEach(btn => {
                        btn.addEventListener('click', () => {
                            const newFirstName = prompt('Edit First Name:', user.first_name || '');
                            const newLastName = prompt('Edit Last Name:', user.last_name || '');
                            const newEmail = prompt('Edit Email:', user.email || '');
                            if (newFirstName !== null && newLastName !== null && newEmail !== null) {
                                supabase.from('profiles').update({ first_name: newFirstName, last_name: newLastName, email: newEmail }).eq('email', user.email).then(() => {
                                    logAdminAction(supabase, session.user.id, 'Edit User', `Edited user ${user.email}`);
                                    location.reload();
                                });
                            }
                        });
                    });

                    // Delete buttons (both mobile and desktop)
                    const deleteBtns = userList.querySelectorAll(`.delete-btn[data-user-idx='${idx}']`);
                    deleteBtns.forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
                                supabase.from('profiles').delete().eq('email', user.email).then(() => {
                                    logAdminAction(supabase, session.user.id, 'Delete User', `Deleted user ${user.email}`);
                                    location.reload();
                                });
                            }
                        });
                    });

                    // Role selects (both mobile and desktop)
                    const roleSelects = userList.querySelectorAll(`.role-select[data-user-idx='${idx}']`);
                    roleSelects.forEach(select => {
                        select.addEventListener('change', (e) => {
                            const newRole = e.target.value;
                            supabase.from('profiles').update({ role: newRole }).eq('email', user.email).then(() => {
                                logAdminAction(supabase, session.user.id, 'Change Role', `Changed role for ${user.email} to ${newRole}`);
                                location.reload();
                            });
                        });
                    });

                    // Reset password buttons (both mobile and desktop)
                    const resetBtns = userList.querySelectorAll(`.reset-btn[data-user-idx='${idx}']`);
                    resetBtns.forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const newPassword = prompt('Enter new password for user:', '');
                            if (newPassword) {
                                // Supabase does not allow direct password reset by admin, so you may need to trigger a password reset email or use an edge function
                                alert('Password reset functionality requires Supabase admin API or edge function.');
                                logAdminAction(supabase, session.user.id, 'Reset Password', `Attempted password reset for ${user.email}`);
                            }
                        });
                    });

                    // Suspend/activate buttons (both mobile and desktop)
                    const suspendBtns = userList.querySelectorAll(`.suspend-btn[data-user-idx='${idx}']`);
                    suspendBtns.forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const newStatus = !user.suspended;
                            await supabase.from('profiles').update({ suspended: newStatus }).eq('email', user.email);
                            logAdminAction(supabase, session.user.id, newStatus ? 'Suspend User' : 'Activate User', `${newStatus ? 'Suspended' : 'Activated'} user ${user.email}`);
                            location.reload();
                        });
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
