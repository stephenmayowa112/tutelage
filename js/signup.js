import { supabase } from './supabase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const message = document.getElementById('message');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = ''; // Clear previous messages
        message.className = 'text-center mt-4'; // Reset class

        const firstName = event.target.first_name.value;
        const lastName = event.target.last_name.value;
        const email = event.target.email.value;
        const password = event.target.password.value;
        const role = event.target.role.value;

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

        // Step 2: Insert the profile into the public.profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    role: role,
                },
            ]);

        if (profileError) {
            // If profile insertion fails, you might want to handle this, 
            // e.g., by deleting the created user or asking them to complete their profile later.
            message.textContent = `Error creating profile: ${profileError.message}`;
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
