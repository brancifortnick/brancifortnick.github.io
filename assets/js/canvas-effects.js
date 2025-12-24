/**
 * Interactive Particle Network Canvas Effect
 * Creates an animated particle system with mouse interaction
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        particleCount: 100,
        particleSpeed: 0.5,
        connectionDistance: 150,
        mouseRadius: 200,
        particleSize: 2,
        lineOpacity: 0.15,
        particleOpacity: 0.6,
        colors: {
            particles: 'rgba(100, 149, 237, 0.6)', // Cornflower blue
            lines: 'rgba(100, 149, 237, 0.15)',
            mouseEffect: 'rgba(147, 112, 219, 0.8)' // Medium purple
        }
    };

    class Particle {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.vx = (Math.random() - 0.5) * config.particleSpeed;
            this.vy = (Math.random() - 0.5) * config.particleSpeed;
            this.radius = config.particleSize;
        }

        update(mouse) {
            // Mouse interaction
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    const force = (config.mouseRadius - distance) / config.mouseRadius;
                    const angle = Math.atan2(dy, dx);
                    this.vx -= Math.cos(angle) * force * 0.5;
                    this.vy -= Math.sin(angle) * force * 0.5;
                }
            }

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Add slight random movement
            this.vx += (Math.random() - 0.5) * 0.1;
            this.vy += (Math.random() - 0.5) * 0.1;

            // Boundary check
            if (this.x < 0 || this.x > this.canvas.width) {
                this.vx *= -1;
                this.x = Math.max(0, Math.min(this.canvas.width, this.x));
            }
            if (this.y < 0 || this.y > this.canvas.height) {
                this.vy *= -1;
                this.y = Math.max(0, Math.min(this.canvas.height, this.y));
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.colors.particles;
            ctx.fill();
        }
    }

    class ParticleNetwork {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: null, y: null };
            this.animationId = null;

            this.init();
            this.setupEventListeners();
            this.animate();
        }

        init() {
            this.resize();
            this.createParticles();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                this.particles.push(new Particle(this.canvas));
            }
        }

        setupEventListeners() {
            window.addEventListener('resize', () => {
                this.resize();
                this.createParticles();
            });

            this.canvas.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });

            // Touch support
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            });

            this.canvas.addEventListener('touchend', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }

        connectParticles() {
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = (1 - distance / config.connectionDistance) * config.lineOpacity;
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = config.colors.lines.replace('0.15', opacity);
                        this.ctx.lineWidth = 1;
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.stroke();
                    }
                }
            }
        }

        drawMouseEffect() {
            if (this.mouse.x && this.mouse.y) {
                this.ctx.beginPath();
                this.ctx.arc(this.mouse.x, this.mouse.y, config.mouseRadius, 0, Math.PI * 2);
                const gradient = this.ctx.createRadialGradient(
                    this.mouse.x, this.mouse.y, 0,
                    this.mouse.x, this.mouse.y, config.mouseRadius
                );
                gradient.addColorStop(0, 'rgba(147, 112, 219, 0.1)');
                gradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw mouse effect
            this.drawMouseEffect();

            // Update and draw particles
            this.particles.forEach(particle => {
                particle.update(this.mouse);
                particle.draw(this.ctx);
            });

            // Connect particles
            this.connectParticles();

            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new ParticleNetwork('particle-canvas');
        });
    } else {
        new ParticleNetwork('particle-canvas');
    }

})();
