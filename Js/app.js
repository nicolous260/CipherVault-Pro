/**
 * CipherVault Pro - Main Application
 * Entry point and global error handling
 */

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e);
    if (typeof ui !== 'undefined') {
        ui.showToast('An error occurred. Check console.', 'error');
    }
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise:', e.reason);
});

// Service Worker Registration (for PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker file
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Visibility API - Save drafts when switching tabs
document.addEventListener('visibilitychange', () => {
    if (document.hidden && typeof ui !== 'undefined') {
        const input = document.getElementById('inputText')?.value;
        const password = document.getElementById('password')?.value;
        if (input || password) {
            storage.saveDraft(input, password);
        }
    }
});

// Expose globals for debugging (remove in production)
window.CipherVault = {
    version: '2.0.0',
    crypto: cryptoEngine,
    storage: storage,
    ui: () => ui,
    effects: () => effects
};

console.log('%c🔐 CipherVault Pro v2.0.0', 'color: #00f0ff; font-size: 20px; font-weight: bold;');
console.log('%cClient-side encryption initialized', 'color: #888;');
