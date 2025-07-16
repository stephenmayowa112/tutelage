import { supabase } from './supabase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        message.textContent = '';
        const email = form.email.value;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset_password.html'
        });

        if (error) {
            message.textContent = error.message;
            message.className = 'text-red-500 text-center mt-4';
        } else {
            message.textContent = 'A password reset link has been sent to your email.';
            message.className = 'text-green-500 text-center mt-4';
        }
    });
});
