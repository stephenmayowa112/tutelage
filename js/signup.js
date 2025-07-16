import { supabase } from './supabase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const message = document.getElementById('message');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = ''; // Clear previous messages
        message.className = 'text-center mt-4'; // Reset class

        const email = event.target.email.value;
        const password = event.target.password.value;
        const role = event.target.role.value; // Keep role for redirection

        // Step 1: Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) {
            message.textContent = `Error: ${authError.message}`;
            message.classList.add('text-red-500');
            return;
        }

        if (!authData.user) {
            message.textContent = 'An unknown error occurred during sign up. Please try again.';
            message.classList.add('text-red-500');
            return;
        }

        // Redirect based on role
        if (role === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else if (role === 'parent') {
            window.location.href = 'parent_dashboard.html';
        } else if (role === 'tutor') {
            window.location.href = 'tutor_dashboard.html';
        } else if (role === 'school') {
            window.location.href = 'school_dashboard.html';
        } else {
            // Fallback for undefined roles
            window.location.href = 'index.html';
        }
        message.textContent = 'Success! Please check your email to confirm your account.';
        message.classList.add('text-green-500');
        signupForm.reset();
    });
});
