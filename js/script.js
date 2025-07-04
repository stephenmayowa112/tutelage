const btn = document.querySelector("button.mobile-menu-button");
const menu = document.querySelector(".mobile-menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
        const scrollY = window.scrollY;
        const opacity = Math.max(0.8, 1 - scrollY / 100); 
        navbar.style.backgroundColor = `rgba(51, 10, 89, ${opacity})`; 
    }
});

AOS.init();