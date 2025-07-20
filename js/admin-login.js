import { supabase } from './supabase-init.js';

const form = document.getElementById('admin-login-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    const email = form.email.value.trim();
    const password = form.password.value;

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
        errorMessage.textContent = 'Invalid email or password.';
        errorMessage.classList.remove('hidden');
        return;
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        errorMessage.textContent = 'Access Denied: You are not an admin.';
        errorMessage.classList.remove('hidden');
        await supabase.auth.signOut();
        return;
    }

    // Redirect to admin dashboard
    window.location.href = 'admin_dashboard.html';
});
