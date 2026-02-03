/**
 * CipherVault Pro - Cryptography Module
 * Handles all encryption/decryption operations
 */

class CryptoEngine {
    constructor() {
        this.algorithms = {
            'AES': this.encryptAES.bind(this),
            'TripleDES': this.encryptTripleDES.bind(this),
            'Rabbit': this.encryptRabbit.bind(this),
            'RC4': this.encryptRC4.bind(this)
        };
        
        this.decryptAlgorithms = {
            'AES': this.decryptAES.bind(this),
            'TripleDES': this.decryptTripleDES.bind(this),
            'Rabbit': this.decryptRabbit.bind(this),
            'RC4': this.decryptRC4.bind(this)
        };
    }
    
    // Encryption Methods
    encryptAES(text, password) {
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(text, password, { iv: iv });
        return { ciphertext: encrypted.toString(), iv: iv };
    }
    
    encryptTripleDES(text, password) {
        const iv = CryptoJS.lib.WordArray.random(8);
        const encrypted = CryptoJS.TripleDES.encrypt(text, password, { iv: iv });
        return { ciphertext: encrypted.toString(), iv: iv };
    }
    
    encryptRabbit(text, password) {
        const encrypted = CryptoJS.Rabbit.encrypt(text, password);
        return { ciphertext: encrypted.toString(), iv: null };
    }
    
    encryptRC4(text, password) {
        const encrypted = CryptoJS.RC4.encrypt(text, password);
        return { ciphertext: encrypted.toString(), iv: null };
    }
    
    // Decryption Methods
    decryptAES(ciphertext, password, iv) {
        const options = iv ? { iv: iv } : {};
        const decrypted = CryptoJS.AES.decrypt(ciphertext, password, options);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
    
    decryptTripleDES(ciphertext, password, iv) {
        const options = iv ? { iv: iv } : {};
        const decrypted = CryptoJS.TripleDES.decrypt(ciphertext, password, options);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
    
    decryptRabbit(ciphertext, password) {
        const decrypted = CryptoJS.Rabbit.decrypt(ciphertext, password);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
    
    decryptRC4(ciphertext, password) {
        const decrypted = CryptoJS.RC4.decrypt(ciphertext, password);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
    
    // Main Process Method
    process(data, password, algorithm, mode, format) {
        try {
            if (mode === 'encrypt') {
                return this.encrypt(data, password, algorithm, format);
            } else {
                return this.decrypt(data, password, algorithm);
            }
        } catch (error) {
            throw new Error(`Cryptography error: ${error.message}`);
        }
    }
    
    encrypt(text, password, algorithm, format) {
        const result = this.algorithms[algorithm](text, password);
        const timestamp = new Date().toISOString();
        const hash = CryptoJS.SHA256(text).toString();
        
        if (format === 'json') {
            return JSON.stringify({
                v: "2.0",
                alg: algorithm,
                iv: result.iv ? CryptoJS.enc.Base64.stringify(result.iv) : null,
                data: result.ciphertext,
                ts: timestamp,
                meta: {
                    chars: text.length,
                    hash: hash.substring(0, 16)
                }
            }, null, 2);
        } else {
            return result.ciphertext;
        }
    }
    
    decrypt(data, password, algorithm) {
        let ciphertext = data;
        let iv = null;
        let algo = algorithm;
        
        // Try to parse JSON
        try {
            const json = JSON.parse(data);
            if (json.data) {
                ciphertext = json.data;
                algo = json.alg || algorithm;
                if (json.iv) {
                    iv = CryptoJS.enc.Base64.parse(json.iv);
                }
            }
        } catch (e) {
            // Raw ciphertext
        }
        
        const result = this.decryptAlgorithms[algo](ciphertext, password, iv);
        
        if (!result) {
            throw new Error('Invalid password or corrupted data');
        }
        
        return result;
    }
    
    // Utility Methods
    generatePassword(length = 16) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        return password;
    }
    
    calculateHash(text) {
        return CryptoJS.SHA256(text).toString();
    }
    
    calculateCrackTime(password) {
        const pool = (/[a-z]/.test(password) ? 26 : 0) +
                     (/[A-Z]/.test(password) ? 26 : 0) +
                     (/[0-9]/.test(password) ? 10 : 0) +
                     (/[^A-Za-z0-9]/.test(password) ? 32 : 0);
        
        const combinations = Math.pow(pool || 1, password.length);
        const guessesPerSecond = 10000000000; // 10 billion/sec
        
        const seconds = combinations / guessesPerSecond;
        
        if (seconds < 1) return 'INSTANT';
        if (seconds < 60) return Math.round(seconds) + ' SEC';
        if (seconds < 3600) return Math.round(seconds/60) + ' MIN';
        if (seconds < 86400) return Math.round(seconds/3600) + ' HOURS';
        if (seconds < 31536000) return Math.round(seconds/86400) + ' DAYS';
        if (seconds < 3153600000) return Math.round(seconds/31536000) + ' YEARS';
        return 'CENTURIES';
    }
    
    checkStrength(password) {
        const checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password),
            extra: password.length > 12
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        const percentage = (score / 5) * 100;
        
        const labels = ['CRITICAL', 'WEAK', 'FAIR', 'GOOD', 'STRONG', 'UNBREAKABLE'];
        const label = labels[score];
        
        return {
            score,
            percentage,
            label,
            checks,
            crackTime: this.calculateCrackTime(password)
        };
    }
}

// Export for use in other modules
const cryptoEngine = new CryptoEngine();
