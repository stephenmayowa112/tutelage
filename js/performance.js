// Performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Prefetch critical pages on hover
    const criticalLinks = document.querySelectorAll('a[href*=".html"]');
    criticalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = this.href;
            document.head.appendChild(prefetchLink);
        }, { once: true });
    });
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
    
    // Web Vitals monitoring (optional)
    function sendToAnalytics(metric) {
        // Send to your analytics service
        console.log('Web Vital:', metric);
    }
    
    // Measure Core Web Vitals
    if ('web-vitals' in window) {
        web-vitals.getCLS(sendToAnalytics);
        web-vitals.getFID(sendToAnalytics);
        web-vitals.getLCP(sendToAnalytics);
    }
});
