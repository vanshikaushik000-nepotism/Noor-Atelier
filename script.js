/* ============================================
   NOOR ATELIER - JavaScript
   Physics Engine + Interactions
   ============================================ */

// ─── Wait for DOM ───
document.addEventListener('DOMContentLoaded', () => {

  // ─── Loading Screen ───
  const loader = document.querySelector('.loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
      initParticles();
      initAntiGravity();
    }, 2400);
  });

  // ─── Custom Cursor ───
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const trails = [];
  const TRAIL_COUNT = 8;

  // Create trail elements
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const t = document.createElement('div');
    t.className = 'cursor-trail';
    t.style.background = i % 2 === 0 ? 'var(--neon-pink)' : 'var(--electric-purple)';
    document.body.appendChild(t);
    trails.push({ el: t, x: 0, y: 0 });
  }

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    dotX += (mouseX - dotX) * 0.2;
    dotY += (mouseY - dotY) * 0.2;
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;

    if (dot) {
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
    }
    if (ring) {
      ring.style.transform = `translate(${ringX - 17.5}px, ${ringY - 17.5}px)`;
    }

    // Trail
    for (let i = trails.length - 1; i > 0; i--) {
      trails[i].x = trails[i - 1].x;
      trails[i].y = trails[i - 1].y;
    }
    trails[0].x = dotX;
    trails[0].y = dotY;

    trails.forEach((t, i) => {
      const scale = 1 - (i / TRAIL_COUNT);
      t.el.style.transform = `translate(${t.x - 3}px, ${t.y - 3}px) scale(${scale})`;
      t.el.style.opacity = scale * 0.4;
    });

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effect on interactive elements
  document.querySelectorAll('a, button, .product-card, .lookbook-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring && ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring && ring.classList.remove('hover'));
  });

  // ─── Navbar Scroll ───
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  });

  // ─── Mobile Menu ───
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // ─── Smooth Scroll ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks.classList.remove('open');
      }
    });
  });

  // ─── Particle System ───
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
      const hero = canvas.parentElement;
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#ff2d95', '#b026ff', '#ff6b2b', '#39ff14'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Mouse repulsion in hero
        const dx = p.x - mouseX;
        const dy = p.y - (mouseY - canvas.getBoundingClientRect().top);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.vx += dx / dist * 0.3;
          p.vy += dy / dist * 0.3;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
      });

      // Draw connections
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ─── Anti-Gravity Physics Engine ───
  function initAntiGravity() {
    const container = document.querySelector('.antigravity-section');
    if (!container) return;

    const elements = container.querySelectorAll('.ag-element');
    const bodies = [];

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      bodies.push({
        el: el,
        x: parseFloat(el.dataset.x) || (Math.random() * (container.offsetWidth - 150)),
        y: parseFloat(el.dataset.y) || (Math.random() * (container.offsetHeight - 150)),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        w: el.offsetWidth,
        h: el.offsetHeight,
        mass: el.offsetWidth * el.offsetHeight * 0.001,
        dragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0,
        rotation: Math.random() * 10 - 5,
        rotVel: (Math.random() - 0.5) * 0.5,
        friction: 0.985,
        restitution: 0.7
      });
    });

    // Drag interaction
    let activeBody = null;
    let lastDragX = 0, lastDragY = 0;

    container.addEventListener('mousedown', (e) => {
      const containerRect = container.getBoundingClientRect();
      const mx = e.clientX - containerRect.left;
      const my = e.clientY - containerRect.top;

      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i];
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          activeBody = b;
          b.dragging = true;
          b.dragOffsetX = mx - b.x;
          b.dragOffsetY = my - b.y;
          lastDragX = mx;
          lastDragY = my;
          b.el.style.zIndex = 20;
          break;
        }
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!activeBody) return;
      const containerRect = container.getBoundingClientRect();
      const mx = e.clientX - containerRect.left;
      const my = e.clientY - containerRect.top;
      activeBody.vx = (mx - lastDragX) * 0.5;
      activeBody.vy = (my - lastDragY) * 0.5;
      activeBody.x = mx - activeBody.dragOffsetX;
      activeBody.y = my - activeBody.dragOffsetY;
      lastDragX = mx;
      lastDragY = my;
    });

    document.addEventListener('mouseup', () => {
      if (activeBody) {
        activeBody.dragging = false;
        activeBody.el.style.zIndex = 5;
        activeBody = null;
      }
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const containerRect = container.getBoundingClientRect();
      const mx = touch.clientX - containerRect.left;
      const my = touch.clientY - containerRect.top;
      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i];
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          activeBody = b;
          b.dragging = true;
          b.dragOffsetX = mx - b.x;
          b.dragOffsetY = my - b.y;
          lastDragX = mx;
          lastDragY = my;
          e.preventDefault();
          break;
        }
      }
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
      if (!activeBody) return;
      const touch = e.touches[0];
      const containerRect = container.getBoundingClientRect();
      const mx = touch.clientX - containerRect.left;
      const my = touch.clientY - containerRect.top;
      activeBody.vx = (mx - lastDragX) * 0.5;
      activeBody.vy = (my - lastDragY) * 0.5;
      activeBody.x = mx - activeBody.dragOffsetX;
      activeBody.y = my - activeBody.dragOffsetY;
      lastDragX = mx;
      lastDragY = my;
      e.preventDefault();
    }, { passive: false });

    container.addEventListener('touchend', () => {
      if (activeBody) {
        activeBody.dragging = false;
        activeBody = null;
      }
    });

    // Physics loop
    function physicsTick() {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;

      bodies.forEach(b => {
        if (b.dragging) {
          b.rotation += b.rotVel;
          b.rotVel *= 0.95;
          b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rotation}deg)`;
          return;
        }

        // Anti-gravity: gentle float upward + random drift
        b.vy -= 0.02; // upward force
        b.vx += (Math.random() - 0.5) * 0.1;
        b.vy += (Math.random() - 0.5) * 0.1;

        // Mouse repulsion
        const containerRect = container.getBoundingClientRect();
        const relMouseX = mouseX - containerRect.left;
        const relMouseY = mouseY - containerRect.top;
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const dx = cx - relMouseX;
        const dy = cy - relMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180 * 1.5;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
        }

        b.vx *= b.friction;
        b.vy *= b.friction;
        b.x += b.vx;
        b.y += b.vy;

        // Wall bounce
        if (b.x < 0) { b.x = 0; b.vx *= -b.restitution; }
        if (b.x + b.w > cw) { b.x = cw - b.w; b.vx *= -b.restitution; }
        if (b.y < 0) { b.y = 0; b.vy *= -b.restitution; }
        if (b.y + b.h > ch) { b.y = ch - b.h; b.vy *= -b.restitution; }

        // Rotation
        b.rotVel += b.vx * 0.02;
        b.rotVel *= 0.98;
        b.rotation += b.rotVel;

        b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rotation}deg)`;
      });

      // Body-body collision
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i], b = bodies[j];
          const acx = a.x + a.w / 2, acy = a.y + a.h / 2;
          const bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
          const dx = bcx - acx, dy = bcy - acy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (Math.max(a.w, a.h) + Math.max(b.w, b.h)) / 2.5;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = minDist - dist;
            const totalMass = a.mass + b.mass;

            if (!a.dragging) {
              a.x -= nx * overlap * (b.mass / totalMass);
              a.y -= ny * overlap * (b.mass / totalMass);
            }
            if (!b.dragging) {
              b.x += nx * overlap * (a.mass / totalMass);
              b.y += ny * overlap * (a.mass / totalMass);
            }

            const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
            const dvDotN = dvx * nx + dvy * ny;
            if (dvDotN > 0) {
              const impulse = dvDotN / totalMass * 1.2;
              if (!a.dragging) { a.vx -= impulse * b.mass * nx; a.vy -= impulse * b.mass * ny; }
              if (!b.dragging) { b.vx += impulse * a.mass * nx; b.vy += impulse * a.mass * ny; }
            }
          }
        }
      }

      requestAnimationFrame(physicsTick);
    }
    physicsTick();
  }

  // ─── Product Card 3D Tilt ───
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ─── Magnetic Buttons ───
  document.querySelectorAll('.hero-cta, .floating-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ─── Scroll Reveal ───
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ─── Stats Counter Animation ───
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count);
          const suffix = counter.dataset.suffix || '';
          let current = 0;
          const increment = target / 60;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            counter.textContent = Math.floor(current) + suffix;
          }, 25);
        });
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) statObserver.observe(statsSection);

  // ─── Runway Auto-Slider ───
  const slides = document.querySelectorAll('.runway-slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4000);
  }

  // ─── Lookbook Fullscreen Preview ───
  const preview = document.querySelector('.fullscreen-preview');
  const previewImg = preview ? preview.querySelector('img') : null;
  const previewClose = preview ? preview.querySelector('.fullscreen-close') : null;

  document.querySelectorAll('.lookbook-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img && previewImg && preview) {
        previewImg.src = img.src;
        preview.classList.add('active');
      }
    });
  });

  if (previewClose) {
    previewClose.addEventListener('click', () => preview.classList.remove('active'));
  }
  if (preview) {
    preview.addEventListener('click', (e) => {
      if (e.target === preview) preview.classList.remove('active');
    });
  }

  // ─── Music Toggle ───
  const musicBtn = document.querySelector('.music-toggle');
  let musicPlaying = false;
  // We'll use Web Audio API for a simple ambient tone
  let audioCtx, oscillator, gainNode;
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (!musicPlaying) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        musicBtn.textContent = '♫ ON';
        musicPlaying = true;
      } else {
        if (oscillator) oscillator.stop();
        if (audioCtx) audioCtx.close();
        musicBtn.textContent = '♫ OFF';
        musicPlaying = false;
      }
    });
  }

  // ─── Parallax Blobs ───
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    document.querySelectorAll('.blob').forEach((blob, i) => {
      const speed = 0.03 + i * 0.015;
      blob.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });

  // ─── Dynamic Gradient Background ───
  let hue = 0;
  function animateGradient() {
    hue = (hue + 0.2) % 360;
    const hero = document.querySelector('.hero-bg-gradient');
    if (hero) {
      hero.style.background = `
        radial-gradient(ellipse at 20% 50%, hsla(${hue + 280}, 80%, 40%, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 50%, hsla(${hue + 330}, 80%, 50%, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, hsla(${hue + 20}, 80%, 50%, 0.1) 0%, transparent 50%)
      `;
    }
    requestAnimationFrame(animateGradient);
  }
  animateGradient();

  // ─── Testimonial Auto-Scroll ───
  const testimTrack = document.querySelector('.testimonial-track');
  if (testimTrack) {
    let scrollDir = 1;
    setInterval(() => {
      testimTrack.scrollLeft += scrollDir;
      if (testimTrack.scrollLeft >= testimTrack.scrollWidth - testimTrack.clientWidth) scrollDir = -1;
      if (testimTrack.scrollLeft <= 0) scrollDir = 1;
    }, 30);
  }

});
