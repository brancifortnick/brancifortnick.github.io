/**
 * Custom Cursor Effect
 * Creates a rotating ring around the cursor
 */

(function() {
    'use strict';

    class CustomCursor {
        constructor() {
            this.cursor = null;
            this.cursorRing = null;
            this.particles = [];
            this.mouse = { x: 0, y: 0 };
            this.cursorPos = { x: 0, y: 0 };
            this.rotation = 0;
            
            this.init();
        }

        init() {
            // Create cursor elements
            this.createCursorElements();
            this.setupEventListeners();
            this.animate();
        }

        createCursorElements() {
            // Create cursor dot
            this.cursor = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            document.body.appendChild(this.cursor);

            // Create rotating ring
            this.cursorRing = document.createElement('div');
            this.cursorRing.className = 'custom-cursor-ring';
            document.body.appendChild(this.cursorRing);

            // Add CSS
            const style = document.createElement('style');
            style.textContent = `
                .custom-cursor {
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: rgba(127, 179, 255, 0.8);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    box-shadow: 0 0 10px rgba(127, 179, 255, 0.6);
                    transition: transform 0.1s ease;
                }

                .custom-cursor-ring {
                    position: fixed;
                    width: 40px;
                    height: 40px;
                    border: 2px solid rgba(147, 112, 219, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    transition: all 0.15s ease;
                    border-top-color: rgba(127, 179, 255, 0.8);
                    border-right-color: rgba(127, 179, 255, 0.6);
                    border-bottom-color: rgba(147, 112, 219, 0.4);
                    border-left-color: rgba(147, 112, 219, 0.6);
                }

                .custom-cursor-ring.active {
                    width: 60px;
                    height: 60px;
                    border-width: 3px;
                }

                body {
                    cursor: none !important;
                }

                a, button, .clickable {
                    cursor: none !important;
                }

                /* Cursor trail particle */
                .cursor-particle {
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: rgba(127, 179, 255, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9998;
                    animation: fadeOut 0.6s ease-out forwards;
                }

                @keyframes fadeOut {
                    to {
                        opacity: 0;
                        transform: scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setupEventListeners() {
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;

                // Create trail particle occasionally
                if (Math.random() < 0.3) {
                    this.createTrailParticle(e.clientX, e.clientY);
                }
            });

            document.addEventListener('mousedown', () => {
                this.cursorRing.classList.add('active');
                this.cursor.style.transform = 'scale(0.8)';
            });

            document.addEventListener('mouseup', () => {
                this.cursorRing.classList.remove('active');
                this.cursor.style.transform = 'scale(1)';
            });

            // Hide custom cursor when leaving window
            document.addEventListener('mouseleave', () => {
                this.cursor.style.opacity = '0';
                this.cursorRing.style.opacity = '0';
            });

            document.addEventListener('mouseenter', () => {
                this.cursor.style.opacity = '1';
                this.cursorRing.style.opacity = '1';
            });
        }

        createTrailParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'cursor-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 600);
        }

        animate() {
            // Smooth cursor follow
            this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * 0.15;
            this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * 0.15;

            // Update cursor position
            this.cursor.style.left = this.cursorPos.x - 4 + 'px';
            this.cursor.style.top = this.cursorPos.y - 4 + 'px';

            // Update ring position with rotation
            this.rotation += 2;
            this.cursorRing.style.left = this.cursorPos.x - 20 + 'px';
            this.cursorRing.style.top = this.cursorPos.y - 20 + 'px';
            this.cursorRing.style.transform = `rotate(${this.rotation}deg)`;

            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new CustomCursor();
        });
    } else {
        new CustomCursor();
    }

})();
