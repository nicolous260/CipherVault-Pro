/**
 * CipherVault Pro - UI Module
 * Handles DOM manipulation and user interactions
 */

class UIManager {
    constructor() {
        this.elements = {};
        this.currentMode = 'encrypt';
        this.currentFormat = 'json';
        this.soundEnabled = true;
        
        this.cacheElements();
        this.bindEvents();
        this.init();
    }
    
    cacheElements() {
        // Main elements
        this.elements.input = document.getElementById('inputText');
        this.elements.output = document.getElementById('outputText');
        this.elements.password = document.getElementById('password');
        this.elements.algorithm = document.getElementById('algorithm');
        this.elements.dropZone = document.getElementById('dropZone');
        this.elements.toastContainer = document.getElementById('toastContainer');
        
        // Stats
        this.elements.statCount = document.getElementById('statCount');
        this.elements.statChars = document.getElementById('statChars');
        this.elements.statStrength = document.getElementById('statStrength');
        this.elements.statCrack = document.getElementById('statCrack');
        
        // Buttons
        this.elements.btnEncrypt = document.getElementById('btnEncrypt');
        this.elements.btnDecrypt = document.getElementById('btnDecrypt');
        this.elements.executeBtn = document.getElementById('executeBtn');
        this.elements.copyBtn = document.getElementById('copyBtn');
        this.elements.downloadBtn = document.getElementById('downloadBtn');
        this.elements.clearBtn = document.getElementById('clearAll');
        this.elements.generatePass = document.getElementById('generatePass');
        
        // Mode indicator
        this.elements.modeIndicator = document.getElementById('modeIndicator');
    }
    
    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Load saved data
        const draft = storage.getDraft();
        if (draft.input) this.elements.input.value = draft.input;
        if (draft.password) {
            this.elements.password.value = draft.password;
            this.checkPasswordStrength();
        }
        
        this.updateStats();
        this.renderHistory();
    }
    
    bindEvents() {
        // Mode switching
        this.elements.btnEncrypt.addEventListener('click', () => this.setMode('encrypt'));
        this.elements.btnDecrypt.addEventListener('click', () => this.setMode('decrypt'));
        
        // Format switching
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFormat(e.target.dataset.format));
        });
        
        // Password strength
        this.elements.password.addEventListener('input', () => this.checkPasswordStrength());
        
        // Input stats
        this.elements.input.addEventListener('input', () => this.updateStats());
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFile(e));
        document.getElementById('attachBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        // Execute
        this.elements.executeBtn.addEventListener('click', () => this.execute());
        
        // Copy/Download
        this.elements.copyBtn.addEventListener('click', () => this.copyOutput());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadOutput());
        
        // Clear
        this.elements.clearBtn.addEventListener('click', () => this.clearAll());
        
        // Generate password
        this.elements.generatePass.addEventListener('click', () => this.generatePassword());
        
        // Paste
        document.getElementById('pasteBtn').addEventListener('click', () => this.pasteText());
        
        // QR
        document.getElementById('qrBtn').addEventListener('click', () => this.showQR());
        document.getElementById('generateQR').addEventListener('click', () => this.showQR());
        document.getElementById('closeQR').addEventListener('click', () => this.hideQR());
        document.getElementById('downloadQR').addEventListener('click', () => this.downloadQR());
        
        // History
        document.getElementById('clearHistory').addEventListener('click', () => {
            storage.clearHistory();
            this.renderHistory();
            this.showToast('History cleared', 'success');
        });
        
        // Demo
        document.getElementById('loadDemo').addEventListener('click', () => this.loadDemo());
        
        // Help
        document.getElementById('showHelp').addEventListener('click', () => this.showHelp());
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Fullscreen
        document.getElementById('fullscreenToggle').addEventListener('click', () => this.toggleFullscreen());
        
        // Mobile
        document.querySelector('.handle').addEventListener('click', () => {
            document.getElementById('mobileControls').classList.toggle('expanded');
        });
        
        // Visibility toggles
        document.querySelectorAll('.toggle-visibility').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleVisibility(e.target.closest('.toggle-visibility').dataset.target));
        });
        
        // Auto-save
        window.addEventListener('beforeunload', () => {
            if (document.getElementById('autoSave').checked) {
                storage.saveDraft(this.elements.input.value, this.elements.password.value);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    setMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        this.elements.btnEncrypt.classList.toggle('active', mode === 'encrypt');
        this.elements.btnDecrypt.classList.toggle('active', mode === 'decrypt');
        this.elements.modeIndicator.classList.toggle('decrypt', mode === 'decrypt');
        
        // Update button text
        const icon = mode === 'encrypt' ? 'fa-lock' : 'fa-unlock';
        const text = mode === 'encrypt' ? 'Encrypt' : 'Decrypt';
        this.elements.executeBtn.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
        
        // Update placeholders
        this.elements.input.placeholder = mode === 'encrypt' 
            ? 'Enter text to encrypt...' 
            : 'Enter encrypted text to decrypt...';
        this.elements.output.placeholder = mode === 'encrypt'
            ? 'Encrypted data will appear here...'
            : 'Decrypted text will appear here...';
        
        // Visual feedback
        if (typeof effects !== 'undefined') {
            effects.createParticles(window.innerWidth / 2, 100, mode === 'encrypt' ? '#00f0ff' : '#ff00a0');
        }
    }
    
    setFormat(format) {
        this.currentFormat = format;
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });
    }
    
    checkPasswordStrength() {
        const password = this.elements.password.value;
        const strength = cryptoEngine.checkStrength(password);
        
        // Update bar
        document.getElementById('strengthFill').style.width = strength.percentage + '%';
        document.getElementById('strengthLabel').textContent = strength.label;
        document.getElementById('statStrength').textContent = Math.round(strength.percentage) + '%';
        document.getElementById('statCrack').textContent = strength.crackTime;
        
        // Update requirements
        document.querySelectorAll('.req-item').forEach(item => {
            const req = item.dataset.req;
            item.classList.toggle('met', strength.checks[req]);
        });
        
        // Color coding
        const colors = ['#ff0044', '#ffaa00', '#ffaa00', '#3b82f6', '#00ff88', '#00ff88'];
        document.getElementById('strengthLabel').style.color = colors[strength.score];
    }
    
    updateStats() {
        const text = this.elements.input.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        document.getElementById('inputStats').textContent = `${chars} chars | ${words} words`;
        this.elements.statChars.textContent = chars;
        
        // Update hash
        if (chars > 0) {
            const hash = cryptoEngine.calculateHash(text);
            document.getElementById('hashValue').textContent = hash.substring(0, 32) + '...';
        } else {
            document.getElementById('hashValue').textContent = '--';
        }
    }
    
    execute() {
        const input = this.elements.input.value;
        const password = this.elements.password.value;
        const algorithm = this.elements.algorithm.value;
        
        if (!input) {
            this.showToast('Please enter data to process', 'error');
            this.elements.input.focus();
            return;
        }
        
        if (!password) {
            this.showToast('Please enter a password', 'error');
            this.elements.password.focus();
            return;
        }
        
        try {
            const result = cryptoEngine.process(
                input, 
                password, 
                algorithm, 
                this.currentMode, 
                this.currentFormat
            );
            
            this.elements.output.value = result;
            
            // Save to history
            storage.addToHistory({
                type: this.currentMode.toUpperCase(),
                length: input.length,
                algorithm: algorithm
            });
            
            // Update count
            const count = storage.incrementCount();
            this.elements.statCount.textContent = count;
            
            this.renderHistory();
            this.showToast(`${this.currentMode === 'encrypt' ? 'Encryption' : 'Decryption'} successful`, 'success');
            
            // Effects
            if (typeof effects !== 'undefined') {
                effects.createParticles(
                    window.innerWidth / 2, 
                    window.innerHeight / 2, 
                    this.currentMode === 'encrypt' ? '#00ff88' : '#00f0ff'
                );
            }
            
            if (this.soundEnabled) this.playSound('success');
            
        } catch (error) {
            this.showToast(error.message, 'error');
            if (this.soundEnabled) this.playSound('error');
        }
    }
    
    copyOutput() {
        const output = this.elements.output;
        if (!output.value) {
            this.showToast('Nothing to copy', 'error');
            return;
        }
        
        output.select();
        document.execCommand('copy');
        this.showToast('Copied to clipboard', 'success');
    }
    
    downloadOutput() {
        const text = this.elements.output.value;
        if (!text) {
            this.showToast('Nothing to download', 'error');
            return;
        }
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cipher_${this.currentMode}_${Date.now()}.${this.currentFormat === 'json' ? 'json' : 'txt'}`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('File downloaded', 'success');
    }
    
    clearAll() {
        if (!confirm('Clear all data?')) return;
        
        this.elements.input.value = '';
        this.elements.output.value = '';
        this.elements.password.value = '';
        this.checkPasswordStrength();
        this.updateStats();
        storage.clearDrafts();
        
        this.showToast('All data cleared', 'success');
    }
    
    generatePassword() {
        const password = cryptoEngine.generatePassword(16);
        this.elements.password.value = password;
        this.checkPasswordStrength();
        this.showToast('Password generated', 'success');
        
        if (typeof effects !== 'undefined') {
            effects.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff00a0');
        }
    }
    
    setupDragAndDrop() {
        const dropZone = this.elements.dropZone;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        this.elements.input.addEventListener('dragenter', () => {
            dropZone.classList.add('active');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            if (e.relatedTarget === this.elements.input) {
                dropZone.classList.remove('active');
            }
        });
        
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('active');
            const files = e.dataTransfer.files;
            if (files.length) this.readFile(files[0]);
        });
    }
    
    handleFile(e) {
        if (e.target.files.length) {
            this.readFile(e.target.files[0]);
        }
    }
    
    readFile(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            this.elements.input.value = event.target.result;
            this.updateStats();
            this.showToast(`Loaded: ${file.name}`, 'success');
        };
        reader.readAsText(file);
    }
    
    pasteText() {
        navigator.clipboard.readText().then(text => {
            this.elements.input.value = text;
            this.updateStats();
            this.showToast('Pasted from clipboard', 'success');
        }).catch(() => {
            this.showToast('Failed to read clipboard', 'error');
        });
    }
    
    showQR() {
        const text = this.elements.output.value;
        if (!text) {
            this.showToast('No output to encode', 'error');
            return;
        }
        
        document.getElementById('qrModal').classList.add('active');
        
        new QRious({
            element: document.getElementById('qrCanvas'),
            value: text.substring(0, 1000),
            size: 300,
            background: '#0a0a0f',
            foreground: '#00f0ff',
            level: 'H'
        });
    }
    
    hideQR() {
        document.getElementById('qrModal').classList.remove('active');
    }
    
    downloadQR() {
        const canvas = document.getElementById('qrCanvas');
        const link = document.createElement('a');
        link.download = 'cipher-qr.png';
        link.href = canvas.toDataURL();
        link.click();
        this.showToast('QR code downloaded', 'success');
    }
    
    renderHistory() {
        const history = storage.getHistory();
        const container = document.getElementById('historyList');
        
        if (history.length === 0) {
            container.innerHTML = '<div class="empty-state">No operations yet</div>';
            return;
        }
        
        container.innerHTML = history.slice(0, 10).map(item => `
            <div class="history-item ${item.type.toLowerCase()}">
                <div>
                    <i class="fas fa-${item.type === 'ENCRYPT' ? 'lock text-cyan' : 'unlock text-purple'}"></i>
                    ${item.type}
                </div>
                <div>${item.length}c | ${item.algorithm}</div>
                <div class="text-secondary">${new Date(item.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }
    
    loadDemo() {
        this.elements.input.value = 'Welcome to CipherVault Pro - Your secure encryption suite. This is military-grade AES-256 encryption in action.';
        this.elements.password.value = 'DemoPass123!';
        this.checkPasswordStrength();
        this.updateStats();
        this.showToast('Demo data loaded', 'success');
    }
    
    showHelp() {
        alert(`Keyboard Shortcuts:
Ctrl+E - Execute Encrypt/Decrypt
Ctrl+C - Copy Output
Ctrl+D - Clear All Data
Tab - Switch Mode`);
    }
    
    toggleVisibility(targetId) {
        const input = document.getElementById(targetId);
        const icon = document.querySelector(`[data-target="${targetId}"] i`);
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        btn.innerHTML = this.soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute text-secondary"></i>';
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audio = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        
        osc.connect(gain);
        gain.connect(audio.destination);
        
        if (type === 'success') {
            osc.frequency.setValueAtTime(800, audio.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2);
            osc.start(audio.currentTime);
            osc.stop(audio.currentTime + 0.2);
        } else if (type === 'error') {
            osc.frequency.setValueAtTime(200, audio.currentTime);
            gain.gain.setValueAtTime(0.1, audio.currentTime);
            osc.start(audio.currentTime);
            osc.stop(audio.currentTime + 0.3);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'e':
                    e.preventDefault();
                    this.execute();
                    break;
                case 'c':
                    if (document.activeElement !== this.elements.output) {
                        e.preventDefault();
                        this.copyOutput();
                    }
                    break;
                case 'd':
                    e.preventDefault();
                    this.clearAll();
                    break;
            }
        }
    }
    
    updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle text-green' : 'fa-exclamation-circle text-red'}"></i>
            <span>${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize UI when DOM is ready
let ui;
document.addEventListener('DOMContentLoaded', () => {
    ui = new UIManager();
});
