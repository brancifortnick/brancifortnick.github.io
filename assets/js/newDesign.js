(function() {
    'use strict';

    // ────────────────────────────────────────────────
    // CONFIGURATION
    // ────────────────────────────────────────────────
    const config = {
        // Waves
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

        // Stars
        stars: {
            count: 220,               // lowered a bit for better mobile perf
            size: { min: 1, max: 3.5 },
            twinkleSpeed: 0.02,
            shootingStarChance: 0.0035
        },

        // Constellations
        constellation: {
            connectionDistance: 240,
            lineOpacity: 0.25,
            maxConnections: 4
        },

        // Mouse interaction
        mouse: {
            radius: 160,
            repulsionForce: 0.28
        },

        // Lightning
        lightning: {
            chance: 0.0028,
            maxBolts: 3,
            branchProbability: 0.32,
            segmentLength: 15,
            maxSegments: 28,
            thickness: 2.2,
            color: 'rgba(220, 230, 255, 0.92)',
            glowColor: 'rgba(140, 190, 255, 0.35)'
        }
    };

    // ────────────────────────────────────────────────
    // STAR CLASS
    // ────────────────────────────────────────────────
    class Star {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.baseSize = config.stars.size.min + Math.random() * (config.stars.size.max - config.stars.size.min);
            this.size = this.baseSize;
            this.opacity = 0.4 + Math.random() * 0.6;
            this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
            this.twinkleSpeed = config.stars.twinkleSpeed * (0.6 + Math.random() * 0.8);
            this.vx = 0;
            this.vy = 0;
        }

        update(mouse) {
            // Twinkle
            this.opacity += this.twinkleSpeed * this.twinkleDirection;
            if (this.opacity >= 1 || this.opacity <= 0.4) this.twinkleDirection *= -1;

            // Mouse repulsion
            if (mouse.x && mouse.y) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < config.mouse.radius) {
                    const force = (config.mouse.radius - dist) / config.mouse.radius;
                    this.vx += (dx / dist || 0) * force * config.mouse.repulsionForce;
                    this.vy += (dy / dist || 0) * force * config.mouse.repulsionForce;
                }
            }

            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.96;
            this.vy *= 0.96;

            // Wrap around screen
            if (this.x < 0) this.x += this.canvas.width;
            if (this.x > this.canvas.width) this.x -= this.canvas.width;
            if (this.y < 0) this.y += this.canvas.height;
            if (this.y > this.canvas.height) this.y -= this.canvas.height;

            this.size = this.baseSize * (0.85 + this.opacity * 0.15);
        }

        draw(ctx, mouse) {
            ctx.save();
            let drawOpacity = this.opacity;
            let drawSize = this.size;

            if (mouse?.x && mouse?.y) {
                const distToMouse = Math.hypot(this.x - mouse.x, this.y - mouse.y);
                if (distToMouse < 110) {
                    const intensity = 1 - (distToMouse / 110);
                    drawOpacity = Math.min(1, this.opacity * (1 + intensity * 0.9));
                    drawSize *= (1 + intensity * 0.6);
                }
            }

            ctx.globalAlpha = drawOpacity;

            // Glow halo
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, drawSize * 2.5);
            gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
            gradient.addColorStop(0.4, 'rgba(200,220,255,0.5)');
            gradient.addColorStop(1, 'rgba(100,149,237,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawSize * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = `rgba(255,255,255,${drawOpacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // ────────────────────────────────────────────────
    // SHOOTING STAR
    // ────────────────────────────────────────────────
    class ShootingStar {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = 0;
            this.length = 60 + Math.random() * 50;
            this.speed = 4 + Math.random() * 4;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.7;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.opacity = 1;
            this.life = 0;
            this.maxLife = 50 + Math.random() * 50;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            this.opacity = 1 - (this.life / this.maxLife);
            return this.life < this.maxLife && this.y < this.canvas.height * 1.2;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;

            const gradient = ctx.createLinearGradient(
                this.x, this.y,
                this.x - this.vx * this.length / this.speed,
                this.y - this.vy * this.length / this.speed
            );
            gradient.addColorStop(0, `rgba(255,255,255,${this.opacity})`);
            gradient.addColorStop(1, 'rgba(100,149,237,0)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * this.length / this.speed, this.y - this.vy * this.length / this.speed);
            ctx.stroke();

            ctx.restore();
        }
    }

    // ────────────────────────────────────────────────
    // LIGHTNING BOLT
    // ────────────────────────────────────────────────
    class Lightning {
        constructor(canvas) {
            this.canvas = canvas;
            this.segments = [];
            this.branches = [];
            this.life = 0;
            this.maxLife = 16;
            this.opacity = 1;
            this.generate();
        }

        generate() {
            const startX = Math.random() * this.canvas.width;
            const startY = 0;
            this.segments = [];
            this.branches = [];

            this.generateBolt(startX, startY, Math.PI / 2, this.segments, config.lightning.maxSegments);

            // Branches
            for (let i = 0; i < this.segments.length; i += 4 + ~~(Math.random() * 4)) {
                if (Math.random() < config.lightning.branchProbability) {
                    const branch = [];
                    const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
                    this.generateBolt(
                        this.segments[i].x,
                        this.segments[i].y,
                        angle,
                        branch,
                        Math.floor(config.lightning.maxSegments / 2.5)
                    );
                    this.branches.push(branch);
                }
            }
        }

        generateBolt(x, y, angle, segments, maxSeg) {
            let cx = x, cy = y;
            let cAngle = angle;

            for (let i = 0; i < maxSeg; i++) {
                cAngle += (Math.random() - 0.5) * 0.9;
                cAngle = Math.max(Math.PI / 5, Math.min(4 * Math.PI / 5, cAngle));

                const len = config.lightning.segmentLength * (0.6 + Math.random() * 0.8);
                const nx = cx + Math.cos(cAngle) * len;
                const ny = cy + Math.sin(cAngle) * len;

                segments.push({ x: cx, y: cy, x2: nx, y2: ny });

                cx = nx;
                cy = ny;

                if (ny > this.canvas.height * 0.95) break;
            }
        }

        update() {
            this.life++;
            if (this.life < 4) this.opacity = 1;
            else if (this.life < 7) this.opacity = 0.25;
            else if (this.life < 10) this.opacity = 0.9;
            else this.opacity = Math.max(0, 1 - (this.life - 10) / (this.maxLife - 10));
            return this.life < this.maxLife;
        }

        draw(ctx) {
            if (this.opacity <= 0.02) return;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.shadowBlur = 18;
            ctx.shadowColor = config.lightning.glowColor;
            ctx.strokeStyle = config.lightning.color;
            ctx.lineWidth = config.lightning.thickness;
            ctx.lineCap = 'round';

            // Main bolt
            this.segments.forEach(s => {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x2, s.y2);
                ctx.stroke();
            });

            // Branches
            ctx.globalAlpha *= 0.65;
            ctx.lineWidth *= 0.7;
            this.branches.forEach(branch => {
                branch.forEach(s => {
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(s.x2, s.y2);
                    ctx.stroke();
                });
            });

            ctx.restore();
        }
    }

    // ────────────────────────────────────────────────
    // MAIN MANAGER
    // ────────────────────────────────────────────────
    class CosmicBackground {
        constructor(canvasId = 'cosmic-canvas') {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                console.warn('Canvas element not found. Expected id: ' + canvasId);
                return;
            }

            this.ctx = this.canvas.getContext('2d');
            this.stars = [];
            this.shootingStars = [];
            this.lightningBolts = [];
            this.mouse = { x: null, y: null };
            this.waveOffset = 0;
            this.animationId = null;

            this.init();
            this.bindEvents();
            this.animate();
        }

        init() {
            this.resize();
            this.createStars();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.createStars(); // re-create on resize for density
        }

        createStars() {
            this.stars = Array.from({ length: config.stars.count }, () => new Star(this.canvas));
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());

            const updateMouse = (e) => {
                this.mouse.x = e.clientX ?? e.touches?.[0]?.clientX;
                this.mouse.y = e.clientY ?? e.touches?.[0]?.clientY;
            };

            this.canvas.addEventListener('mousemove', updateMouse);
            this.canvas.addEventListener('touchmove', updateMouse, { passive: false });

            this.canvas.addEventListener('mouseleave', () => { this.mouse.x = null; this.mouse.y = null; });
            this.canvas.addEventListener('touchend', () => { this.mouse.x = null; this.mouse.y = null; });
        }

        drawWaves() {
            const { count, amplitude, frequency, speed, colors } = config.waves;

            for (let i = 0; i < count; i++) {
                const yOffset = this.canvas.height * 0.58 + i * 45;
                const phase = (i * Math.PI * 1.6) / count;

                this.ctx.beginPath();
                this.ctx.moveTo(0, this.canvas.height);

                for (let x = 0; x <= this.canvas.width; x += 6) {
                    const y = yOffset +
                        Math.sin(x * frequency + this.waveOffset + phase) * amplitude +
                        Math.sin(x * frequency * 1.8 + this.waveOffset * 1.4) * (amplitude * 0.45);

                    this.ctx.lineTo(x, y);
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
            const maxDist = config.constellation.connectionDistance;
            const maxConn = config.constellation.maxConnections;

            for (let i = 0; i < this.stars.length; i++) {
                let connections = 0;
                const starA = this.stars[i];

                for (let j = i + 1; j < this.stars.length && connections < maxConn; j++) {
                    const starB = this.stars[j];
                    const dx = starA.x - starB.x;
                    const dy = starA.y - starB.y;

                    // Cheap axis-aligned filter
                    if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) continue;

                    const dist = Math.hypot(dx, dy);
                    if (dist >= maxDist) continue;

                    let opacity = (1 - dist / maxDist) * config.constellation.lineOpacity *
                                  Math.min(starA.opacity, starB.opacity);

                    let lineWidth = 1;
                    let color = '100, 149, 237';

                    if (this.mouse.x && this.mouse.y) {
                        const midX = (starA.x + starB.x) / 2;
                        const midY = (starA.y + starB.y) / 2;
                        const distToMouse = Math.hypot(midX - this.mouse.x, midY - this.mouse.y);

                        if (distToMouse < 110) {
                            const intensity = 1 - (distToMouse / 110);
                            opacity *= (1 + intensity * 3.2);
                            lineWidth = 1 + intensity * 2.2;
                            color = `${100 - intensity*40}, ${149 + intensity*30}, 237`;
                        }
                    }

                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(${color}, ${Math.min(opacity, 1)})`;
                    this.ctx.lineWidth = lineWidth;
                    this.ctx.moveTo(starA.x, starA.y);
                    this.ctx.lineTo(starB.x, starB.y);
                    this.ctx.stroke();

                    connections++;
                }
            }
        }

        updateShootingStars() {
            if (Math.random() < config.stars.shootingStarChance && this.shootingStars.length < 6) {
                this.shootingStars.push(new ShootingStar(this.canvas));
            }

            this.shootingStars = this.shootingStars.filter(star => {
                const alive = star.update();
                if (alive) star.draw(this.ctx);
                return alive;
            });
        }

        updateLightning() {
            if (Math.random() < config.lightning.chance && this.lightningBolts.length < config.lightning.maxBolts) {
                this.lightningBolts.push(new Lightning(this.canvas));
            }

            this.lightningBolts = this.lightningBolts.filter(bolt => {
                const alive = bolt.update();
                if (alive) bolt.draw(this.ctx);
                return alive;
            });
        }

        animate() {
            this.ctx.fillStyle = 'rgba(8, 12, 35, 1)'; // deep space bg
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.drawWaves();
            this.stars.forEach(s => { s.update(this.mouse); s.draw(this.ctx, this.mouse); });
            this.drawConstellations();
            this.updateShootingStars();
            this.updateLightning();

            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.animationId) cancelAnimationFrame(this.animationId);
        }
    }

    // Auto-init when script loads
    function initCosmicBackground() {
        new CosmicBackground('cosmic-canvas'); // change id if your canvas uses different id
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCosmicBackground);
    } else {
        initCosmicBackground();
    }

})();