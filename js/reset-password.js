import { supabase } from './supabase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const message = document.getElementById('message');

    // Function to parse URL hash parameters
    const getHashParams = () => {
        const params = {};
        window.location.hash.substring(1).split('&').forEach(part => {
            const [key, value] = part.split('=');
            params[key] = value;
        });
        return params;
    };

    const params = getHashParams();
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    if (accessToken && refreshToken) {
        // Set the session from the URL tokens
        supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        }).then(({ error }) => {
            if (error) {
                message.textContent = `Error setting session: ${error.message}`;
                message.classList.add('text-red-500');
            } else {
                message.textContent = 'Session set. Please enter your new password.';
                message.classList.add('text-green-500');
            }
        });
    } else {
        message.textContent = 'Invalid password reset link.';
        message.classList.add('text-red-500');
    }

    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = ''; // Clear previous messages
        message.classList.remove('text-red-500', 'text-green-500');

        const newPassword = event.target.password.value;
        const confirmPassword = event.target['confirm-password'].value;

        if (newPassword !== confirmPassword) {
            message.textContent = 'Passwords do not match.';
            message.classList.add('text-red-500');
            return;
        }

        if (!newPassword) {
            message.textContent = 'Password cannot be empty.';
            message.classList.add('text-red-500');
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            message.textContent = `Error updating password: ${error.message}`;
            message.classList.add('text-red-500');
        } else {
            message.textContent = 'Password updated successfully! Redirecting to login...';
            message.classList.add('text-green-500');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    });
});
