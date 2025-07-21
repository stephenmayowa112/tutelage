import { supabase } from './supabase-init.js';

const btn = document.querySelector("button.mobile-menu-button");
const menu = document.querySelector(".mobile-menu");

if (btn && menu) {
    btn.addEventListener("click", () => {
        menu.classList.toggle("hidden");
    });
}

AOS.init();

// Handle password recovery links
const handleRecovery = async () => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (!error) {
            window.location.href = 'reset_password.html';
        } else {
            console.error('Error setting session:', error.message);
        }
    }
};

// Handle user state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        window.location.href = 'reset_password.html';
    }
});

// Check if the user is logged in and redirect if necessary
const checkUserLoggedIn = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        const { data: user, error } = await supabase.auth.getUser();
        if (user) {
            const userRole = user.user.user_metadata.role;
            if (userRole === 'tutor') {
                window.location.href = 'tutor_dashboard.html';
            } else if (userRole === 'parent') {
                window.location.href = 'parent_dashboard.html';
            } else if (userRole === 'school') {
                window.location.href = 'school_dashboard.html';
            } else if (userRole === 'admin') {
                window.location.href = 'admin_dashboard.html';
            }
        }
    }
};

// Logout functionality
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

// Protect routes
const protectRoute = async (allowedRoles) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user) {
        window.location.href = 'login.html';
        return;
    }

    const userRole = user.user.user_metadata.role;
    if (!allowedRoles.includes(userRole)) {
        window.location.href = 'login.html'; // Or a dedicated "unauthorized" page
    }
};

// Fetch and display user data on dashboards
const displayUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
    }
};

// Page-specific logic
if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html')) {
    checkUserLoggedIn();
}

if (window.location.pathname.endsWith('reset_password.html')) {
    handleRecovery();
}

if (window.location.pathname.endsWith('tutor_dashboard.html')) {
    protectRoute(['tutor']);
    displayUserData();
} else if (window.location.pathname.endsWith('parent_dashboard.html')) {
    protectRoute(['parent']);
    displayUserData();
} else if (window.location.pathname.endsWith('school_dashboard.html')) {
    protectRoute(['school']);
    displayUserData();
} else if (window.location.pathname.endsWith('admin_dashboard.html')) {
    protectRoute(['admin']);
    displayUserData();
}
