import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// These should be in supabase-init.js, but are here for clarity
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

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
