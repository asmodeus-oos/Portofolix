/* ==========================================================================
   PREMIUM LIQUID-GLASS PORTFOLIO LOGIC & INTERACTION
   Aesthetics: Apple VisionOS + Linear + Arc + Tesla
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize All Modules
    BackgroundCanvas.init();
    CardParallax.init();
    ScrollEffects.init();
    ProjectCarousel.init();
    GithubIntegration.init();
    ContactForm.init();
    Navigation.init();
    CustomCursor.init();
    MagneticButtons.init();
    CertificateLightbox.init();
});

/* --------------------------------------------------------------------------
   2. INTERACTIVE AMBIENT CANVAS BACKGROUND
   -------------------------------------------------------------------------- */
class LightBlob {
    constructor(x, y, radius, color, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
        this.targetX = x;
        this.targetY = y;
    }

    update(width, height, mouse) {
        // Move towards target / wander
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > width) {
            this.speedX = -this.speedX;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > height) {
            this.speedY = -this.speedY;
        }

        // Mouse gravity influence
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 400) {
                const force = (400 - dist) / 400 * 0.45;
                this.x += (dx / dist) * force;
                this.y += (dy / dist) * force;
            }
        }
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class DustParticle {
    constructor(x, y, size, speedY, opacity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedY = speedY;
        this.opacity = opacity;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = Math.random() * 0.02 - 0.01;
    }

    update(width, height, mouse) {
        this.y += this.speedY;
        this.angle += this.spin;
        this.x += Math.sin(this.angle) * 0.25;

        // Reset if offscreen
        if (this.y < -10) {
            this.y = height + 10;
            this.x = Math.random() * width;
        }

        // Push away from mouse
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 100) {
                const force = (100 - dist) / 100 * 2;
                this.x -= (dx / dist) * force;
                this.y -= (dy / dist) * force;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const BackgroundCanvas = {
    canvas: null,
    ctx: null,
    blobs: [],
    particles: [],
    mouse: { x: null, y: null },
    animationId: null,
    themeColors: [
        'rgba(212, 175, 55, 0.12)', // Gold
        'rgba(229, 193, 88, 0.10)',  // Soft Light Gold
        'rgba(197, 155, 39, 0.08)',  // Medium Gold
        'rgba(168, 124, 17, 0.10)'   // Deep Gold
    ],
    isReducedMotion: false,

    init() {
        this.canvas = document.getElementById('ambient-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        window.ambientCanvasInstance = this;

        // Check accessibility options
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.isReducedMotion) {
            this.canvas.style.display = 'none';
            return;
        }

        this.resize();
        this.createBlobs();
        this.createParticles();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        this.loop();
    },

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.ctx.scale(dpr, dpr);
    },

    createBlobs() {
        this.blobs = [];
        const colors = this.themeColors;
        
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Spawn blobs positioned nicely
        this.blobs.push(new LightBlob(w * 0.2, h * 0.25, Math.min(w, h) * 0.35, colors[0], 0.4, 0.35));
        this.blobs.push(new LightBlob(w * 0.8, h * 0.2, Math.min(w, h) * 0.3, colors[1], -0.3, 0.4));
        this.blobs.push(new LightBlob(w * 0.35, h * 0.75, Math.min(w, h) * 0.35, colors[2], 0.35, -0.3));
        this.blobs.push(new LightBlob(w * 0.75, h * 0.8, Math.min(w, h) * 0.4, colors[3], -0.4, -0.3));
    },

    createParticles() {
        this.particles = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        const particleCount = Math.min(Math.floor(w / 25), 45); // Adapt count to resolution
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new DustParticle(
                Math.random() * w,
                Math.random() * h,
                Math.random() * 1.5 + 0.5,
                -(Math.random() * 0.4 + 0.15),
                Math.random() * 0.25 + 0.05
            ));
        }
    },

    loop() {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw and update Blobs
        this.blobs.forEach(blob => {
            blob.update(window.innerWidth, window.innerHeight, this.mouse);
            blob.draw(this.ctx);
        });

        // Draw and update Particles
        this.particles.forEach(p => {
            p.update(window.innerWidth, window.innerHeight, this.mouse);
            p.draw(this.ctx);
        });

        this.animationId = requestAnimationFrame(() => this.loop());
    }
};

/* --------------------------------------------------------------------------
   3. 3D PARALLAX TILT EFFECT
   -------------------------------------------------------------------------- */
const CardParallax = {
    cards: [],

    init() {
        this.cards = document.querySelectorAll('.glass-panel');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
            card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
        });
    },

    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position inside element
        const y = e.clientY - rect.top;  // y position inside element
        
        // Set spotlight coordinates
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
        if (card.getAttribute('data-parallax') === 'true') {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Maximum tilt of 6 degrees
            const rotateX = ((centerY - y) / centerY) * 6;
            const rotateY = ((x - centerX) / centerX) * 6;
            
            // Apply transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
        }
    },

    handleMouseLeave(card) {
        if (card.getAttribute('data-parallax') === 'true') {
            // Smooth return transition
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
    }
};

/* --------------------------------------------------------------------------
   4. SCROLL REVEALS & ANIMS (Intersection Observer)
   -------------------------------------------------------------------------- */
const ScrollEffects = {
    init() {
        this.setupReveals();
        this.setupTimelineProgress();
        this.setupNumericCounters();
    },

    setupReveals() {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    },

    setupTimelineProgress() {
        const timeline = document.querySelector('.timeline-container');
        const progressLine = document.querySelector('.timeline-progress');
        const items = document.querySelectorAll('.timeline-item');
        if (!timeline || !progressLine) return;

        window.addEventListener('scroll', () => {
            const timelineRect = timeline.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Calculate how much of the timeline is scrolled past
            const topPassed = viewportHeight * 0.5 - timelineRect.top;
            const progress = Math.min(Math.max(0, topPassed / timelineRect.height), 1);
            
            progressLine.style.height = `${progress * 100}%`;

            // Active items activation
            items.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                if (itemRect.top < viewportHeight * 0.5) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    },

    setupNumericCounters() {
        const stats = document.querySelectorAll('[data-counter]');
        if (stats.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetEl = entry.target;
                    const numberEl = targetEl.querySelector('.stat-number');
                    const targetVal = parseInt(targetEl.getAttribute('data-counter'), 10);
                    
                    this.animateCount(numberEl, targetVal);
                    observer.unobserve(targetEl);
                }
            });
        }, { threshold: 0.2 });

        stats.forEach(stat => observer.observe(stat));
    },

    animateCount(el, targetVal) {
        let current = 0;
        const duration = 1500; // 1.5s duration
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out expo curve
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            current = Math.floor(easeProgress * targetVal);
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = targetVal; // Lock to exact target at end
            }
        }

        requestAnimationFrame(update);
    }
};

/* --------------------------------------------------------------------------
   5. PROJECT CAROUSEL SLIDESHOW
   -------------------------------------------------------------------------- */
const ProjectCarousel = {
    slides: [],
    indicators: [],
    prevBtn: null,
    nextBtn: null,
    currentIndex: 0,

    init() {
        this.slides = document.querySelectorAll('.project-slide');
        this.indicators = document.querySelectorAll('.carousel-indicators .indicator');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');

        if (this.slides.length === 0) return;

        this.prevBtn.addEventListener('click', () => this.moveSlide(-1));
        this.nextBtn.addEventListener('click', () => this.moveSlide(1));

        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    },

    moveSlide(direction) {
        let newIndex = this.currentIndex + direction;
        if (newIndex < 0) newIndex = this.slides.length - 1;
        if (newIndex >= this.slides.length) newIndex = 0;
        this.goToSlide(newIndex);
    },

    goToSlide(index) {
        this.slides[this.currentIndex].classList.remove('active');
        this.indicators[this.currentIndex].classList.remove('active');

        this.currentIndex = index;

        this.slides[this.currentIndex].classList.add('active');
        this.indicators[this.currentIndex].classList.add('active');
    }
};

/* --------------------------------------------------------------------------
   6. REAL-TIME GITHUB INTEGRATION
   -------------------------------------------------------------------------- */
const GithubIntegration = {
    username: 'asmodeus-oos',
    repos: [],
    filteredRepos: [],
    searchVal: '',
    langFilter: 'all',
    sortBy: 'stars',
    
    // Rich fallback data in case of API rate limits
    fallbackData: {
        profile: {
            name: "Mohamed Hegazy",
            bio: "Dental Student | UI/UX Designer | Front-End Developer | Technology Enthusiast combining clinical precision with visual engineering.",
            followers: 64,
            following: 42,
            avatar_url: "assets/profile.png"
        },
        repos: [
            {
                name: "Zenata",
                description: "Upgraded Dental Clinic Management System (v2). Cloud-native, real-time patient workflow tracking, clinical charting, and analytics.",
                stargazers_count: 210,
                forks_count: 52,
                language: "TypeScript",
                updated_at: "2026-06-20T08:00:00Z"
            },
            {
                name: "ZenDenta",
                description: "Full Dental Clinic Management System designed to streamline patient scheduling, treatment plans, and billing operations (v1).",
                stargazers_count: 185,
                forks_count: 45,
                language: "TypeScript",
                updated_at: "2026-06-19T10:00:00Z"
            },
            {
                name: "ExamiX",
                description: "A modern exams time management app built for educators and students to coordinate tests.",
                stargazers_count: 92,
                forks_count: 12,
                language: "TypeScript",
                updated_at: "2026-06-12T14:20:00Z"
            },
            {
                name: "android_device_oneplus_sm8450-common",
                description: "Common device tree for any OnePlus/Realme device working with Snapdragon 8 Gen 1 (SM8450), combined with a device-specific tree like Realme GT 2 Pro.",
                stargazers_count: 45,
                forks_count: 9,
                language: "Makefile",
                updated_at: "2026-06-08T09:15:00Z"
            },
            {
                name: "android_kernel_oneplus_sm8450",
                description: "High-performance custom kernel trees for OnePlus 10 Pro 5G and SM8450 chipset devices.",
                stargazers_count: 55,
                forks_count: 15,
                language: "C",
                updated_at: "2026-06-08T09:15:00Z"
            },
            {
                name: "android_device_realme_ferrari",
                description: "Custom Android device trees and configurations for Realme GT 2 Pro / GT Neo 3T (codename ferrari).",
                stargazers_count: 42,
                forks_count: 6,
                language: "Python",
                updated_at: "2026-06-05T18:45:00Z"
            },
            {
                name: "presentation",
                description: "A web-designed presentation for an event in fixed prosthodontics, featuring high-fidelity interactive slides and layouts.",
                stargazers_count: 18,
                forks_count: 2,
                language: "HTML",
                updated_at: "2026-06-15T12:00:00Z"
            }
        ]
    },

    init() {
        this.setupControls();
        this.fetchGithubData();
    },

    setupControls() {
        const searchInput = document.getElementById('repo-search');
        const langSelect = document.getElementById('repo-filter-lang');
        const sortSelect = document.getElementById('repo-sort');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchVal = e.target.value.toLowerCase();
                this.applyFiltersAndRender();
            });
        }

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.langFilter = e.target.value.toLowerCase();
                this.applyFiltersAndRender();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFiltersAndRender();
            });
        }
    },

    async fetchGithubData() {
        try {
            // Fetch User Profile
            const profileRes = await fetch(`https://api.github.com/users/${this.username}`);
            if (!profileRes.ok) throw new Error('API Rate Limit or Network Error');
            const profileData = await profileRes.json();
            
            // Fetch User Repos
            const reposRes = await fetch(`https://api.github.com/users/${this.username}/repos?per_page=100`);
            if (!reposRes.ok) throw new Error('API Rate Limit or Network Error');
            const reposData = await reposRes.json();

            // Filter out forks, old, installerx, magiskboot, and contributions
            this.repos = reposData.filter(repo => {
                if (repo.fork) return false;
                const nameLower = repo.name.toLowerCase();
                if (nameLower.includes('_old')) return false;
                if (nameLower === 'magiskboot') return false;
                if (nameLower === 'installerx-revived' || nameLower === 'installerx') return false;
                if (nameLower === 'nagramx') return false;
                if (nameLower === 'lawnicons') return false;
                return true;
            });
            this.updateProfileUI(profileData);
        } catch (error) {
            console.warn('GitHub API failed, loading premium offline-fallback data: ', error);
            // Load Mock Fallbacks
            this.repos = this.fallbackData.repos;
            this.updateProfileUI(this.fallbackData.profile);
        }

        this.applyFiltersAndRender();
    },

    updateProfileUI(profile) {
        const avatar = document.getElementById('github-avatar');
        const fullName = document.getElementById('github-fullname');
        const bio = document.getElementById('github-bio');
        const followers = document.getElementById('github-followers');
        const following = document.getElementById('github-following');
        const starsEl = document.getElementById('github-stars');

        if (avatar && profile.avatar_url) avatar.src = profile.avatar_url;
        if (fullName && profile.name) fullName.textContent = profile.name;
        if (bio && profile.bio) bio.textContent = profile.bio;
        if (followers) followers.textContent = profile.followers;
        if (following) following.textContent = profile.following;

        // Calculate total stars
        if (starsEl) {
            const totalStars = this.repos.reduce((acc, curr) => acc + (curr.stargazers_count || 0), 0);
            starsEl.textContent = totalStars;
        }
    },

    applyFiltersAndRender() {
        // Filter by Search & Language
        this.filteredRepos = this.repos.filter(repo => {
            const matchesSearch = repo.name.toLowerCase().includes(this.searchVal) || 
                                  (repo.description && repo.description.toLowerCase().includes(this.searchVal));
            
            const matchesLang = this.langFilter === 'all' || 
                                (repo.language && repo.language.toLowerCase() === this.langFilter);
            
            return matchesSearch && matchesLang;
        });

        // Sort Repositories
        this.filteredRepos.sort((a, b) => {
            if (this.sortBy === 'stars') {
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            } else if (this.sortBy === 'updated') {
                return new Date(b.updated_at) - new Date(a.updated_at);
            } else if (this.sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });

        this.renderRepos();
    },

    renderRepos() {
        const grid = document.getElementById('repos-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.filteredRepos.length === 0) {
            grid.innerHTML = `
                <div class="glass-panel" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
                    <p style="color: var(--text-tertiary); font-weight: 500;">No repositories match the current filters.</p>
                </div>
            `;
            return;
        }

        const languageColors = {
            go: '#00ADD8',
            python: '#3572A5',
            typescript: '#3178C6',
            javascript: '#F1E05A',
            html: '#E34C26',
            css: '#563D7C'
        };

        this.filteredRepos.forEach(repo => {
            const card = document.createElement('article');
            card.className = 'repo-card glass-panel';
            card.setAttribute('data-parallax', 'true');

            const langColor = languageColors[(repo.language || '').toLowerCase()] || '#8B949E';
            const cleanDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Dynamic Description Override based on repository name
            let displayDesc = repo.description || 'No description provided.';
            if (repo.name === 'android_device_oneplus_sm8450-common') {
                displayDesc = "Common device tree for any OnePlus/Realme device working with Snapdragon 8 Gen 1 (SM8450), combined with a device-specific tree like Realme GT 2 Pro.";
            } else if (repo.name === 'ExamiX') {
                displayDesc = "A modern exams time management app built for educators and students.";
            } else if (repo.name === 'ZenDenta') {
                displayDesc = "Full Dental Clinic Management System designed to streamline patient scheduling, treatment plans, and billing operations (Version 1).";
            } else if (repo.name === 'Zenata') {
                displayDesc = "Upgraded Dental Clinic Management System (Version 2). Cloud-native, real-time patient workflows, billing, and advanced electronic clinical charts.";
            } else if (repo.name === 'presentation') {
                displayDesc = "A web-designed presentation for an event in fixed prosthodontics, featuring high-fidelity interactive slides and layouts.";
            }

            card.innerHTML = `
                <div class="repo-top">
                    <a href="${repo.html_url || 'https://github.com/asmodeus-oos/' + repo.name}" target="_blank" rel="noopener" class="repo-name-link">
                        ${repo.name}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </a>
                    <p class="repo-desc">${displayDesc}</p>
                </div>
                <div class="repo-meta">
                    ${repo.language ? `
                    <span class="repo-lang">
                        <span class="lang-dot" style="background-color: ${langColor}"></span>
                        <span>${repo.language}</span>
                    </span>
                    ` : ''}
                    <span class="repo-stat" title="Stars">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <span>${repo.stargazers_count || 0}</span>
                    </span>
                    <span class="repo-stat" title="Forks">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                        <span>${repo.forks_count || 0}</span>
                    </span>
                    <span style="color: var(--text-tertiary)">Updated ${cleanDate}</span>
                </div>
            `;

            grid.appendChild(card);
        });

        // Re-initialize parallax handlers on newly rendered cards
        CardParallax.init();
    }
};

/* --------------------------------------------------------------------------
   7. PREMIUM CONTACT FORM VALIDATION & MODAL
   -------------------------------------------------------------------------- */
const ContactForm = {
    form: null,
    modal: null,
    closeBtn: null,

    init() {
        this.form = document.getElementById('contact-form');
        this.modal = document.getElementById('success-modal');
        this.closeBtn = document.getElementById('close-modal-btn');

        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add live verification feedback
        const inputs = this.form.querySelectorAll('.glass-input-field');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                // If previously marked invalid, re-validate on input
                if (input.closest('.form-group').classList.contains('invalid')) {
                    this.validateField(input);
                }
            });
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeModal();
            });
        }
    },

    validateField(input) {
        const group = input.closest('.form-group');
        let isValid = true;

        if (input.required && !input.value.trim()) {
            isValid = false;
        }

        if (isValid && input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(input.value.trim());
        }

        if (isValid) {
            group.classList.remove('invalid');
            group.classList.add('valid');
        } else {
            group.classList.remove('valid');
            group.classList.add('invalid');
        }

        return isValid;
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const inputs = this.form.querySelectorAll('.glass-input-field');
        let formIsValid = true;

        inputs.forEach(input => {
            const fieldValid = this.validateField(input);
            if (!fieldValid) formIsValid = false;
        });

        if (formIsValid) {
            const submitBtn = document.getElementById('submit-btn');
            const submitBtnText = submitBtn.querySelector('span');
            
            // Visual feedback: submitting transition
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.opacity = '0.7';
            submitBtnText.textContent = 'Sending...';

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject') ? document.getElementById('subject').value : '',
                message: document.getElementById('message').value
            };

            fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(async (response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.error || 'Failed to dispatch email.');
                }
            })
            .then(data => {
                // Open Success Modal
                this.openModal();
                
                // Reset form elements
                this.form.reset();
                inputs.forEach(input => {
                    input.closest('.form-group').classList.remove('valid', 'invalid');
                });
            })
            .catch(error => {
                console.error(error);
                // Graceful fallback display for missing server-side variables vs actual server failure
                if (error.message && error.message.includes('SMTP credentials')) {
                    alert('SMTP server is not fully configured in your Vercel environment. Please set SMTP_USER and SMTP_PASS under Vercel project variables.');
                } else {
                    alert('Could not dispatch message. Please write to mohamed20020093@ksiu.edu.eg or call directly.');
                }
            })
            .finally(() => {
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.opacity = '1';
                submitBtnText.textContent = 'Send Message';
            });
        }
    },

    openModal() {
        if (!this.modal) return;
        this.modal.classList.add('open');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
};

/* --------------------------------------------------------------------------
   8. ACTIVE SCROLL SPY NAVIGATION & MOBILE TOGGLE
   -------------------------------------------------------------------------- */
const Navigation = {
    header: null,
    menu: null,
    toggleBtn: null,
    navLinks: [],
    sections: [],

    init() {
        this.header = document.querySelector('.header');
        this.menu = document.getElementById('nav-menu');
        this.toggleBtn = document.getElementById('mobile-toggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section');

        this.setupStickyHeader();
        this.setupScrollSpy();
        this.setupMobileMenu();
    },

    setupStickyHeader() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        });
    },

    setupScrollSpy() {
        window.addEventListener('scroll', () => {
            let activeSectionId = '';
            const scrollPos = window.scrollY + 120; // offset navigation height

            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    activeSectionId = section.getAttribute('id');
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${activeSectionId}`) {
                    link.classList.add('active');
                }
            });
        });
    },

    setupMobileMenu() {
        if (!this.toggleBtn || !this.menu) return;

        this.toggleBtn.addEventListener('click', () => {
            const isOpen = this.menu.classList.contains('open');
            if (isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        });

        // Close menu on click of navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    },

    openMenu() {
        this.menu.classList.add('open');
        this.toggleBtn.setAttribute('aria-expanded', 'true');
    },

    closeMenu() {
        this.menu.classList.remove('open');
        this.toggleBtn.setAttribute('aria-expanded', 'false');
    }
};

/* --------------------------------------------------------------------------
   9. CUSTOM LIQUID-GLASS CURSOR TRACKER
   -------------------------------------------------------------------------- */
const CustomCursor = {
    cursor: null,
    dot: null,
    targetX: 0,
    targetY: 0,
    cursorX: 0,
    cursorY: 0,
    isMobile: false,
    isFraming: false,
    frameTarget: null,

    init() {
        this.cursor = document.getElementById('custom-cursor');
        this.dot = document.getElementById('custom-cursor-dot');
        
        if (!this.cursor || !this.dot) return;

        // Check if device supports fine cursor pointers
        this.isMobile = window.matchMedia('(pointer: coarse)').matches || 
                        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (this.isMobile) {
            this.cursor.style.display = 'none';
            this.dot.style.display = 'none';
            return;
        }

        window.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
        });

        // Hide default cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.dot.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
            this.dot.style.opacity = '1';
        });

        this.setupHoverListeners();
        this.loop();
    },

    setupHoverListeners() {
        let currentTarget = null;

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a, button, select, input, textarea, .carousel-btn, .indicator, .social-link, .repo-name-link');
            if (target) {
                if (target !== currentTarget) {
                    currentTarget = target;
                    this.cursor.classList.add('hovered');
                    this.dot.classList.add('hovered');
                    
                    const isNavOrBtn = target.tagName === 'A' || target.tagName === 'BUTTON' || target.classList.contains('social-link') || target.classList.contains('carousel-btn') || target.classList.contains('indicator') || target.classList.contains('repo-name-link');
                    if (isNavOrBtn) {
                        this.isFraming = true;
                        this.frameTarget = target;
                    } else {
                        this.isFraming = false;
                        this.frameTarget = null;
                    }
                }
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (currentTarget) {
                if (!e.relatedTarget || !currentTarget.contains(e.relatedTarget)) {
                    const nextTarget = e.relatedTarget ? e.relatedTarget.closest('a, button, select, input, textarea, .carousel-btn, .indicator, .social-link, .repo-name-link') : null;
                    if (nextTarget !== currentTarget) {
                        this.cursor.classList.remove('hovered');
                        this.dot.classList.remove('hovered');
                        this.isFraming = false;
                        this.frameTarget = null;
                        currentTarget = nextTarget;
                        if (currentTarget) {
                            this.cursor.classList.add('hovered');
                            this.dot.classList.add('hovered');
                            const isNavOrBtn = currentTarget.tagName === 'A' || currentTarget.tagName === 'BUTTON' || currentTarget.classList.contains('social-link') || currentTarget.classList.contains('carousel-btn') || currentTarget.classList.contains('indicator') || currentTarget.classList.contains('repo-name-link');
                            if (isNavOrBtn) {
                                this.isFraming = true;
                                this.frameTarget = currentTarget;
                            }
                        }
                    }
                }
            }
        });
    },

    loop() {
        if (this.isFraming && this.frameTarget) {
            const rect = this.frameTarget.getBoundingClientRect();
            // Center coordinates of target
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;
            
            // Smoothly snap to center of target
            const snapLerp = 0.25;
            this.cursorX += (targetX - this.cursorX) * snapLerp;
            this.cursorY += (targetY - this.cursorY) * snapLerp;
            
            const pad = 8;
            const targetW = rect.width + pad;
            const targetH = rect.height + pad;
            const targetRadius = window.getComputedStyle(this.frameTarget).borderRadius;

            this.cursor.style.width = `${targetW}px`;
            this.cursor.style.height = `${targetH}px`;
            this.cursor.style.borderRadius = targetRadius;
        } else {
            // Instant, lag-free tracking when moving freely
            this.cursorX = this.targetX;
            this.cursorY = this.targetY;
            
            this.cursor.style.width = '24px';
            this.cursor.style.height = '24px';
            this.cursor.style.borderRadius = '50%';
        }

        this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0) translate(-50%, -50%)`;
        this.dot.style.transform = `translate3d(${this.targetX}px, ${this.targetY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(() => this.loop());
    }
};

/* --------------------------------------------------------------------------
   10. MAGNETIC BUTTON EFFECT
   -------------------------------------------------------------------------- */
const MagneticButtons = {
    buttons: [],

    init() {
        this.buttons = document.querySelectorAll('.magnetic-btn');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this.buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => this.handleMagnetic(e, btn));
            btn.addEventListener('mouseleave', () => this.resetMagnetic(btn));
        });
    },

    handleMagnetic(e, btn) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Pull button 35% of the distance to the cursor
        const strength = 0.35;
        const moveX = x * strength;
        const moveY = y * strength;

        btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    },

    resetMagnetic(btn) {
        btn.style.transform = 'translate3d(0, 0, 0)';
    }
};

/* --------------------------------------------------------------------------
   11. CERTIFICATE LIGHTBOX PREVIEW MODAL
   -------------------------------------------------------------------------- */
const CertificateLightbox = {
    trigger: null,
    lightbox: null,
    img: null,
    closeBtn: null,

    init() {
        this.trigger = document.getElementById('depi-cert-trigger');
        this.lightbox = document.getElementById('cert-lightbox');
        
        // Backup support for old custom modal if present
        if (!this.lightbox) {
            this.lightbox = document.getElementById('certificate-modal');
        }
        
        if (this.lightbox) {
            this.img = this.lightbox.querySelector('.lightbox-img') || this.lightbox.querySelector('.modal-cert-img');
            this.closeBtn = this.lightbox.querySelector('.lightbox-close') || this.lightbox.querySelector('.modal-close');
        }

        if (this.trigger && this.lightbox && this.img) {
            this.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.img.src = 'assets/certificate.png';
                this.lightbox.classList.add('active');
                this.lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        }

        if (this.closeBtn && this.lightbox) {
            this.closeBtn.addEventListener('click', () => this.closeLightbox());
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.closeLightbox();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && (this.lightbox.classList.contains('active') || this.lightbox.classList.contains('open'))) {
                    this.closeLightbox();
                }
            });
        }
    },

    closeLightbox() {
        if (!this.lightbox) return;
        this.lightbox.classList.remove('active');
        this.lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }
};
