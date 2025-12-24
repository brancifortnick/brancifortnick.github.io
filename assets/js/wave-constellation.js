/**
 * Wave Background + Constellation Canvas Effect
 * Combines flowing waves with twinkling stars and constellation lines
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        // Wave settings
        waves: {
            count: 3,
            amplitude: 40,
            frequency: 0.02,
            speed: 0.02,
            colors: [
                'rgba(100, 149, 237, 0.15)',
                'rgba(147, 112, 219, 0.12)',
                'rgba(72, 118, 255, 0.1)'
            ]
        },
        // Star settings
        stars: {
            count: 250,
            size: { min: 1, max: 3.5 },
            twinkleSpeed: 0.02,
            shootingStarChance: 0.0005
        },
        // Constellation settings
        constellation: {
            connectionDistance: 250,
            lineOpacity: 0.25,
            maxConnections: 4
        },
        // Mouse interaction
        mouse: {
            radius: 150,
            repulsionForce: 0.3
        },
        // Lightning settings
        lightning: {
            chance: 0.002, // Probability per frame
            maxBolts: 2,
            branchProbability: 0.3,
            segmentLength: 15,
            maxSegments: 30,
            thickness: 2,
            color: 'rgba(200, 220, 255, 0.9)',
            glowColor: 'rgba(127, 179, 255, 0.3)'
        }
    };

    class Star {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
            // Start at random position on first load
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.baseSize = config.stars.size.min + Math.random() * (config.stars.size.max - config.stars.size.min);
            this.size = this.baseSize;
            this.opacity = 0.3 + Math.random() * 0.7; // Start with higher minimum opacity
            this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
            this.twinkleSpeed = config.stars.twinkleSpeed * (0.5 + Math.random());
            this.vx = 0;
            this.vy = 0;
        }

        update(mouse) {
            // Twinkling effect
            this.opacity += this.twinkleSpeed * this.twinkleDirection;
            if (this.opacity >= 1 || this.opacity <= 0.3) {
                this.twinkleDirection *= -1;
            }

            // Mouse interaction - gentle push
            if (mouse.x && mouse.y) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouse.radius) {
                    const force = (config.mouse.radius - distance) / config.mouse.radius;
                    this.vx += (dx / distance) * force * config.mouse.repulsionForce;
                    this.vy += (dy / distance) * force * config.mouse.repulsionForce;
                }
            }

            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Damping
            this.vx *= 0.95;
            this.vy *= 0.95;

            // Wrap around edges
            if (this.x < 0) this.x = this.canvas.width;
            if (this.x > this.canvas.width) this.x = 0;
            if (this.y < 0) this.y = this.canvas.height;
            if (this.y > this.canvas.height) this.y = 0;

            // Size pulsing
            this.size = this.baseSize * (0.8 + this.opacity * 0.2);
        }

        draw(ctx, mouse) {
            ctx.save();
            
            let drawOpacity = this.opacity;
            let drawSize = this.size;
            
            // Check if mouse is hovering near this star
            if (mouse && mouse.x && mouse.y) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distToMouse = Math.sqrt(dx * dx + dy * dy);
                
                if (distToMouse < 100) {
                    const hoverIntensity = 1 - (distToMouse / 100);
                    drawOpacity = Math.min(1, this.opacity * (1 + hoverIntensity * 0.8));
                    drawSize = this.size * (1 + hoverIntensity * 0.5);
                }
            }
            
            ctx.globalAlpha = drawOpacity;
            
            // Star glow
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, drawSize * 2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(100, 149, 237, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Star core
            ctx.fillStyle = 'rgba(255, 255, 255, ' + drawOpacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    class ShootingStar {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
        }

        reset() {
            // Start from random position on top or left side
            if (Math.random() > 0.5) {
                this.x = Math.random() * this.canvas.width;
                this.y = 0;
            } else {
                this.x = 0;
                this.y = Math.random() * this.canvas.height / 2;
            }
            
            this.length = 60 + Math.random() * 40;
            this.speed = 3 + Math.random() * 3;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.opacity = 1;
            this.life = 0;
            this.maxLife = 60 + Math.random() * 40;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            this.opacity = 1 - (this.life / this.maxLife);
            return this.life < this.maxLife;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            const gradient = ctx.createLinearGradient(
                this.x, this.y,
                this.x - this.vx * this.length / this.speed,
                this.y - this.vy * this.length / this.speed
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, ' + this.opacity + ')');
            gradient.addColorStop(1, 'rgba(100, 149, 237, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x - this.vx * this.length / this.speed,
                this.y - this.vy * this.length / this.speed
            );
            ctx.stroke();
            
            ctx.restore();
        }
    }

    class Lightning {
        constructor(canvas) {
            this.canvas = canvas;
            this.segments = [];
            this.branches = [];
            this.life = 0;
            this.maxLife = 15;
            this.opacity = 1;
            this.generate();
        }

        generate() {
            // Start from a random position at the top
            const startX = Math.random() * this.canvas.width;
            const startY = 0;
            
            this.segments = [];
            this.branches = [];
            
            // Generate main bolt
            this.generateBolt(startX, startY, Math.PI / 2, this.segments, config.lightning.maxSegments);
            
            // Generate branches
            for (let i = 0; i < this.segments.length; i += 5) {
                if (Math.random() < config.lightning.branchProbability) {
                    const branch = [];
                    const angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
                    this.generateBolt(
                        this.segments[i].x,
                        this.segments[i].y,
                        angle,
                        branch,
                        Math.floor(config.lightning.maxSegments / 3)
                    );
                    this.branches.push(branch);
                }
            }
        }

        generateBolt(startX, startY, angle, segments, maxSegments) {
            let x = startX;
            let y = startY;
            let currentAngle = angle;
            
            for (let i = 0; i < maxSegments; i++) {
                // Add some randomness to angle
                currentAngle += (Math.random() - 0.5) * 0.8;
                
                // Clamp angle to prevent going too horizontal
                currentAngle = Math.max(Math.PI / 4, Math.min(3 * Math.PI / 4, currentAngle));
                
                const length = config.lightning.segmentLength * (0.7 + Math.random() * 0.6);
                const newX = x + Math.cos(currentAngle) * length;
                const newY = y + Math.sin(currentAngle) * length;
                
                segments.push({ x: x, y: y, x2: newX, y2: newY });
                
                x = newX;
                y = newY;
                
                // Stop if we hit the bottom
                if (y > this.canvas.height) break;
            }
        }

        update() {
            this.life++;
            // Flash effect
            if (this.life < 3) {
                this.opacity = 1;
            } else if (this.life < 6) {
                this.opacity = 0.3;
            } else if (this.life < 9) {
                this.opacity = 0.8;
            } else {
                this.opacity = Math.max(0, 1 - (this.life - 9) / (this.maxLife - 9));
            }
            return this.life < this.maxLife;
        }

        draw(ctx) {
            if (this.opacity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            // Draw glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = config.lightning.glowColor;
            ctx.strokeStyle = config.lightning.color;
            ctx.lineWidth = config.lightning.thickness;
            ctx.lineCap = 'round';
            
            // Draw main bolt
            this.segments.forEach(seg => {
                ctx.beginPath();
                ctx.moveTo(seg.x, seg.y);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.stroke();
            });
            
            // Draw branches
            ctx.globalAlpha = this.opacity * 0.7;
            ctx.lineWidth = config.lightning.thickness * 0.7;
            this.branches.forEach(branch => {
                branch.forEach(seg => {
                    ctx.beginPath();
                    ctx.moveTo(seg.x, seg.y);
                    ctx.lineTo(seg.x2, seg.y2);
                    ctx.stroke();
                });
            });
            
            ctx.restore();
        }
    }

    class WaveConstellation {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.stars = [];
            this.shootingStars = [];
            this.lightningBolts = [];
            this.mouse = { x: null, y: null };
            this.waveOffset = 0;
            this.animationId = null;

            this.init();
            this.setupEventListeners();
            this.animate();
        }

        init() {
            this.resize();
            this.createStars();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createStars() {
            this.stars = [];
            for (let i = 0; i < config.stars.count; i++) {
                this.stars.push(new Star(this.canvas));
            }
        }

        setupEventListeners() {
            window.addEventListener('resize', () => {
                this.resize();
                this.createStars();
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

        drawWaves() {
            const { count, amplitude, frequency, speed, colors } = config.waves;
            
            for (let i = 0; i < count; i++) {
                const yOffset = this.canvas.height * 0.6 + (i * 50);
                const phaseShift = (i * Math.PI * 2) / count;
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.canvas.height);
                
                for (let x = 0; x <= this.canvas.width; x += 5) {
                    const y = yOffset + 
                             Math.sin(x * frequency + this.waveOffset + phaseShift) * amplitude +
                             Math.sin(x * frequency * 2 + this.waveOffset * 1.5) * (amplitude / 2);
                    
                    if (x === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                
                this.ctx.lineTo(this.canvas.width, this.canvas.height);
                this.ctx.lineTo(0, this.canvas.height);
                this.ctx.closePath();
                
                this.ctx.fillStyle = colors[i];
                this.ctx.fill();
            }
            
            this.waveOffset += speed;
        }

        drawConstellations() {
            for (let i = 0; i < this.stars.length; i++) {
                let connections = 0;
                
                for (let j = i + 1; j < this.stars.length; j++) {
                    if (connections >= config.constellation.maxConnections) break;
                    
                    const dx = this.stars[i].x - this.stars[j].x;
                    const dy = this.stars[i].y - this.stars[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.constellation.connectionDistance) {
                        let opacity = (1 - distance / config.constellation.connectionDistance) * 
                                       config.constellation.lineOpacity *
                                       Math.min(this.stars[i].opacity, this.stars[j].opacity);
                        
                        let lineWidth = 1;
                        let color = '100, 149, 237'; // Default blue
                        
                        // Check if mouse is near this constellation line
                        if (this.mouse.x && this.mouse.y) {
                            const midX = (this.stars[i].x + this.stars[j].x) / 2;
                            const midY = (this.stars[i].y + this.stars[j].y) / 2;
                            const distToMouse = Math.sqrt(
                                Math.pow(this.mouse.x - midX, 2) + 
                                Math.pow(this.mouse.y - midY, 2)
                            );
                            
                            // If mouse is hovering near the line
                            if (distToMouse < 100) {
                                const hoverIntensity = 1 - (distToMouse / 100);
                                opacity *= (1 + hoverIntensity * 3); // Brighten line
                                lineWidth = 1 + hoverIntensity * 2; // Thicken line
                                
                                // Change color to purple when hovering
                                const blueAmount = 100 - (hoverIntensity * 50);
                                const purpleAmount = 112 + (hoverIntensity * 50);
                                color = `${blueAmount}, ${purpleAmount}, ${237 - (hoverIntensity * 18)}`;
                            }
                        }
                        
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = `rgba(${color}, ${Math.min(opacity, 1)})`;
                        this.ctx.lineWidth = lineWidth;
                        this.ctx.moveTo(this.stars[i].x, this.stars[i].y);
                        this.ctx.lineTo(this.stars[j].x, this.stars[j].y);
                        this.ctx.stroke();
                        
                        connections++;
                    }
                }
            }
        }

        updateShootingStars() {
            // Create new shooting stars randomly
            if (Math.random() < config.stars.shootingStarChance && this.shootingStars.length < 3) {
                this.shootingStars.push(new ShootingStar(this.canvas));
            }

            // Update and remove dead shooting stars
            this.shootingStars = this.shootingStars.filter(star => {
                const alive = star.update();
                if (alive) star.draw(this.ctx);
                return alive;
            });
        }

        updateLightning() {
            // Create new lightning randomly
            if (Math.random() < config.lightning.chance && this.lightningBolts.length < config.lightning.maxBolts) {
                this.lightningBolts.push(new Lightning(this.canvas));
            }

            // Update and remove dead lightning
            this.lightningBolts = this.lightningBolts.filter(bolt => {
                const alive = bolt.update();
                if (alive) bolt.draw(this.ctx);
                return alive;
            });
        }

        animate() {
            // Clear canvas
            this.ctx.fillStyle = 'rgba(10, 14, 39, 1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw waves
            this.drawWaves();

            // Update and draw stars
            this.stars.forEach(star => {
                star.update(this.mouse);
                star.draw(this.ctx, this.mouse);
            });

            // Draw constellation lines
            this.drawConstellations();

            // Update and draw shooting stars
            this.updateShootingStars();

            // Update and draw lightning
            this.updateLightning();

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
            new WaveConstellation('particle-canvas');
        });
    } else {
        new WaveConstellation('particle-canvas');
    }

})();
