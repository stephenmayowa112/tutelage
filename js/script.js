import { supabase } from './supabase-init.js';

const btn = document.querySelector("button.mobile-menu-button");
const menu = document.querySelector(".mobile-menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

// window.addEventListener('scroll', () => {
//     const navbar = document.getElementById('main-navbar');
//     if (navbar) {
//         const scrollY = window.scrollY;
//         const opacity = Math.max(0.8, 1 - scrollY / 100); 
//         navbar.style.backgroundColor = `rgba(51, 10, 89, ${opacity})`; 
//     }
// });

AOS.init();

// Handle password recovery links
const handleRecovery = async () => {
    console.log('handleRecovery function started.');
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    if (accessToken && refreshToken) {
        console.log('Attempting to set session...');
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (!error) {
            console.log('Session set successfully. Redirecting to login.html');
            window.location.href = 'login.html'; 
        } else {
            console.error('Error setting session:', error.message);
        }
    } else {
        console.log('No access_token or refresh_token found in URL hash.');
    }
};

handleRecovery();