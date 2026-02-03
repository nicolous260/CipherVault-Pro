/**
 * CipherVault Pro - Storage Module
 * Handles localStorage operations and history management
 */

class StorageManager {
    constructor() {
        this.keys = {
            history: 'cipherHistory',
            count: 'operationCount',
            draftInput: 'draftInput',
            draftPassword: 'draftPassword',
            settings: 'cipherSettings'
        };
        
        this.maxHistory = 50;
    }
    
    // History Management
    getHistory() {
        try {
            const data = localStorage.getItem(this.keys.history);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load history:', e);
            return [];
        }
    }
    
    addToHistory(operation) {
        const history = this.getHistory();
        history.unshift({
            ...operation,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        
        // Keep only last N items
        if (history.length > this.maxHistory) {
            history.pop();
        }
        
        localStorage.setItem(this.keys.history, JSON.stringify(history));
        return history;
    }
    
    clearHistory() {
        localStorage.removeItem(this.keys.history);
        return [];
    }
    
    // Operation Count
    getCount() {
        return parseInt(localStorage.getItem(this.keys.count) || '0');
    }
    
    incrementCount() {
        const count = this.getCount() + 1;
        localStorage.setItem(this.keys.count, count.toString());
        return count;
    }
    
    // Drafts
    saveDraft(input, password) {
        try {
            localStorage.setItem(this.keys.draftInput, input);
            localStorage.setItem(this.keys.draftPassword, password);
        } catch (e) {
            console.warn('Failed to save draft:', e);
        }
    }
    
    getDraft() {
        return {
            input: localStorage.getItem(this.keys.draftInput) || '',
            password: localStorage.getItem(this.keys.draftPassword) || ''
        };
    }
    
    clearDrafts() {
        localStorage.removeItem(this.keys.draftInput);
        localStorage.removeItem(this.keys.draftPassword);
    }
    
    // Settings
    saveSettings(settings) {
        localStorage.setItem(this.keys.settings, JSON.stringify(settings));
    }
    
    getSettings() {
        try {
            const data = localStorage.getItem(this.keys.settings);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (e) {
            return this.getDefaultSettings();
        }
    }
    
    getDefaultSettings() {
        return {
            autoSave: true,
            sound: true,
            algorithm: 'AES',
            format: 'json'
        };
    }
    
    // Export/Import
    exportData() {
        const data = {
            history: this.getHistory(),
            count: this.getCount(),
            settings: this.getSettings(),
            exported: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }
    
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.history) localStorage.setItem(this.keys.history, JSON.stringify(data.history));
            if (data.count) localStorage.setItem(this.keys.count, data.count);
            if (data.settings) localStorage.setItem(this.keys.settings, JSON.stringify(data.settings));
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
}

const storage = new StorageManager();
