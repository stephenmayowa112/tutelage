import { supabase } from './supabase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = ''; // Clear previous errors

        const email = event.target.email.value;
        const password = event.target.password.value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            errorMessage.textContent = error.message;
            return;
        }

        // On successful login, check the user's role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            errorMessage.textContent = 'Could not retrieve user profile. Please try again.';
            return;
        }

        // Redirect based on role
        if (profile.role === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else if (profile.role === 'parent') {
            window.location.href = 'parent_dashboard.html';
        } else if (profile.role === 'tutor') {
            window.location.href = 'tutor_dashboard.html';
        } else if (profile.role === 'school') {
            window.location.href = 'school_dashboard.html';
        } else {
            // Fallback for undefined roles
            window.location.href = 'index.html';
        }
    });
});
