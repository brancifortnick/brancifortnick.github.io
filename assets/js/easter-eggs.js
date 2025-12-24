/**
 * Easter Egg Effects and Interactions
 * Fun animations and hidden surprises
 */

(function() {
    'use strict';

    // Configuration
    const colors = [
        'rgba(255, 0, 0, 0.8)',
        'rgba(255, 165, 0, 0.8)',
        'rgba(255, 255, 0, 0.8)',
        'rgba(0, 255, 0, 0.8)',
        'rgba(0, 0, 255, 0.8)',
        'rgba(148, 0, 211, 0.8)'
    ];

    // Konami Code sequence
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    let konamiIndex = 0;

    // Click counter for special effect
    let clickCount = 0;
    let clickTimer = null;

    // Initialize all easter eggs
    function init() {
        setupClickParticles();
        setupSectionAnimations();
        setupKonamiCode();
        setupDoubleClickEffect();
        setupProjectHoverEffects();
        setupSecretMessage();
    }

    // 1. Click Particle Burst Effect
    function setupClickParticles() {
        document.addEventListener('click', function(e) {
            createParticleBurst(e.clientX, e.clientY);
            
            // Track rapid clicks
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                if (clickCount >= 10) {
                    triggerRainbowMode();
                }
                clickCount = 0;
            }, 2000);
        });
    }

    function createParticleBurst(x, y) {
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 2;
            
            particle.style.setProperty('--tx', Math.cos(angle) * velocity * 50 + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * velocity * 50 + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    // 2. Section Click Animations
    function setupSectionAnimations() {
        // Disabled - animations removed to prevent screen shaking
        // Section click animations have been turned off for cleaner UX
    }

    // 3. Konami Code Easter Egg
    function setupKonamiCode() {
        document.addEventListener('keydown', function(e) {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                
                if (konamiIndex === konamiCode.length) {
                    triggerKonamiSuccess();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    function triggerKonamiSuccess() {
        const message = document.createElement('div');
        message.className = 'konami-message';
        message.innerHTML = '🎮 KONAMI CODE ACTIVATED! 🎮<br><span style="font-size: 0.6em;">You found the secret!</span>';
        document.body.appendChild(message);
        
        // Matrix rain effect
        createMatrixRain();
        
        // Play success sound effect (visual feedback)
        document.body.style.animation = 'rainbowPulse 2s ease-in-out';
        
        setTimeout(() => {
            message.remove();
            document.body.style.animation = '';
        }, 3000);
    }

    // 4. Matrix Rain Effect
    function createMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-rain';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);
        
        let frameCount = 0;
        const maxFrames = 200;
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            
            frameCount++;
            if (frameCount < maxFrames) {
                requestAnimationFrame(draw);
            } else {
                canvas.remove();
            }
        }
        
        draw();
    }

    // 5. Double Click Rainbow Mode
    function setupDoubleClickEffect() {
        const banner = document.getElementById('banner');
        
        banner.addEventListener('dblclick', function() {
            triggerRainbowMode();
        });
    }

    function triggerRainbowMode() {
        const allBoxes = document.querySelectorAll('.box, #banner');
        
        allBoxes.forEach((box, index) => {
            setTimeout(() => {
                box.classList.add('easter-egg-active');
                setTimeout(() => {
                    box.classList.remove('easter-egg-active');
                }, 2000);
            }, index * 100);
        });
        
        // Create fireworks effect
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                createParticleBurst(x, y);
            }, i * 200);
        }
    }

    // 6. Project Hover Effects
    function setupProjectHoverEffects() {
        const projectLinks = document.querySelectorAll('section a[href^="http"]');
        
        projectLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1) rotate(2deg)';
                this.style.transition = 'all 0.3s ease';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }

    // 7. Secret Message (Hold 'S' key for 3 seconds)
    function setupSecretMessage() {
        let sKeyTimer = null;
        
        document.addEventListener('keydown', function(e) {
            if (e.key.toLowerCase() === 's') {
                if (!sKeyTimer) {
                    sKeyTimer = setTimeout(() => {
                        showSecretMessage();
                    }, 3000);
                }
            }
        });
        
        document.addEventListener('keyup', function(e) {
            if (e.key.toLowerCase() === 's') {
                clearTimeout(sKeyTimer);
                sKeyTimer = null;
            }
        });
    }

    function showSecretMessage() {
        const message = document.createElement('div');
        message.className = 'konami-message';
        message.style.background = 'rgba(100, 149, 237, 0.95)';
        message.style.border = '2px solid #6495ed';
        message.innerHTML = '🔐 SECRET UNLOCKED! 🔐<br><span style="font-size: 0.5em;">You held the \'S\' key! Nice patience!</span>';
        document.body.appendChild(message);
        
        setTimeout(() => message.remove(), 3000);
    }

    // Additional CSS for click particles
    const style = document.createElement('style');
    style.textContent = `
        .click-particle {
            transform: translate(var(--tx, 0), var(--ty, 0));
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Console easter egg
    console.log('%c🎮 Easter Eggs Available! 🎮', 'color: #6495ed; font-size: 20px; font-weight: bold;');
    console.log('%c1. Click anywhere for particle effects', 'color: #9370db; font-size: 14px;');
    console.log('%c2. Double-click the banner for rainbow mode', 'color: #9370db; font-size: 14px;');
    console.log('%c3. Click sections to see animations', 'color: #9370db; font-size: 14px;');
    console.log('%c4. Try the Konami Code: ↑↑↓↓←→←→BA', 'color: #9370db; font-size: 14px;');
    console.log('%c5. Hold "S" for 3 seconds', 'color: #9370db; font-size: 14px;');
    console.log('%c6. Click rapidly 10 times anywhere', 'color: #9370db; font-size: 14px;');

})();
