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

Option 2: Local Server
python -m http.server 8000
Then visit  http://localhost:8000 

📖 Usage Guide
Basic Encryption
1. 
Enter text in the Input Stream field
2. 
Set a strong password (check the strength meter)
3. 
Select algorithm (AES-256 recommended)
4. 
Click EXECUTE
5. 
Copy or download the encrypted JSON output
File Encryption
 
Drag & Drop files directly onto the input area
 
Supports text files, JSON, CSV, and binary files
Decryption
1. 
Switch to DECRYPT mode
2. 
Paste encrypted JSON or Base64 text
3. 
Enter the same password used for encryption
4. 
Click EXECUTE

⌨️ Keyboard Shortcuts
Shortcut	Action	
`Ctrl + E`	Execute Encrypt/Decrypt	
`Ctrl + C`	Copy output to clipboard	
`Ctrl + D`	Clear all data	

🏗️ Project Structure
ciphervault-pro/
├── index.html              # Main entry point
├── css/
│   ├── style.css          # Core styles & layout
│   ├── animations.css     # Visual effects
│   └── responsive.css     # Mobile adaptations
├── js/
│   ├── app.js             # Application entry
│   ├── crypto.js          # Encryption engine
│   ├── ui.js              # User interface logic
│   ├── effects.js         # Matrix rain & particles
│   └── storage.js         # localStorage management
└── README.md              # This file

🔐 Security Considerations
✅ What's Secure
 
Client-side encryption - Data encrypted in browser before transmission
 
No server storage - Cannot access your data
 
Secure password generation - Uses  crypto.getRandomValues() 
⚠️ Important Warnings
1. 
Password Safety: If you lose your password, data is unrecoverable
2. 
Browser Storage: Auto-save stores drafts in localStorage
3. 
Clipboard: Encrypted data copied may be logged by OS
🛠️ Development
No build step required! To modify:
1. 
Edit HTML/CSS/JS files
2. 
Refresh browser to see changes
3. 
Test encryption/decryption cycles

Browser Support
Browser	Version	Status	
Chrome	80+	✅ Full Support	
Firefox	75+	✅ Full Support	
Safari	13+	✅ Full Support	
Edge	80+	✅ Full Support	
IE	Any	❌ Not Supported	

📜 License
MIT License - see LICENSE file for details.
🙏 Acknowledgments
 
CryptoJS - Encryption library
 
QRious - QR code generation
 
Font Awesome - Icons
<p align="center">
  <sub>Built with 💜 by the CipherVault Team</sub><br>
  <sub>Star ⭐ this repo if you find it useful!</sub>
</p>
```
