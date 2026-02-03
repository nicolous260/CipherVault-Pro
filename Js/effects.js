/**
 * CipherVault Pro - Visual Effects Module
 * Handles Matrix rain, particles, and animations
 */

class EffectsManager {
    constructor() {
        this.matrixCanvas = document.getElementById('matrixCanvas');
        this.matrixCtx = this.matrixCanvas.getContext('2d');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.pCtx = this.particleCanvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initMatrix();
        this.initParticles();
        
        // Click effects
        document.addEventListener('click', (e) => {
            if (e.target.closest('button')) {
                this.createParticles(e.clientX, e.clientY);
            }
        });
    }
    
    resize() {
        this.matrixCanvas.width = window.innerWidth;
        this.matrixCanvas.height = window.innerHeight;
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }
    
    // Matrix Rain Effect
    initMatrix() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
        const fontSize = 14;
        const columns = this.matrixCanvas.width / fontSize;
        const drops = [];
        
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }
        
        const draw = () => {
            this.matrixCtx.fillStyle = 'rgba(5, 5, 8, 0.05)';
            this.matrixCtx.fillRect(0, 0, this.matrixCanvas.width, this.matrixCanvas.height);
            
            this.matrixCtx.fillStyle = '#00f0ff';
            this.matrixCtx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                this.matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > this.matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        setInterval(draw, 50);
    }
    
    // Particle System
    initParticles() {
        const animate = () => {
            this.pCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            
            this.particles = this.particles.filter(p => p.life > 0);
            
            this.particles.forEach(p => {
                p.update();
                p.draw(this.pCtx);
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    createParticles(x, y, color = '#00f0ff') {
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    // Glitch effect on text
    glitchText(element) {
        const original = element.textContent;
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let iterations = 0;
        
        const interval = setInterval(() => {
            element.textContent = original
                .split('')
                .map((char, index) => {
                    if (index < iterations) return original[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            
            if (iterations >= original.length) {
                clearInterval(interval);
                element.textContent = original;
            }
            
            iterations += 1/3;
        }, 30);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.decay = Math.random() * 0.02 + 0.02;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life -= this.decay;
        this.size *= 0.98;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Initialize effects when DOM is ready
let effects;
document.addEventListener('DOMContentLoaded', () => {
    effects = new EffectsManager();
});
