    // --- THEME & UTILS ---
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    if(localStorage.getItem('theme') === 'light') html.classList.add('light');

      toggle?.addEventListener('click', () => {
        html.classList.toggle('light');
        localStorage.setItem('theme', html.classList.contains('light') ? 'light' : 'dark');
      });

    document.getElementById('year').textContent = new Date().getFullYear();

    // --- SCROLL SPY (Robust) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { threshold: 0.2, rootMargin: "-30% 0px -50% 0px" });

    sections.forEach(s => observer.observe(s));

    // --- TEXT ROTATOR (ROLL) ---
    const words = ["Macroecology", "Biogeography", "Functional Ecology", "Conservation", "Biodiversity"];
    let i = 0;
    const el = document.getElementById('rotator');

    setInterval(() => {
      el.style.opacity = '0'; // Fade out
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i]; // Change text
        el.style.opacity = '1'; // Fade in
      }, 300); // Matches transition duration
    }, 3000);

    // --- CAROUSEL ---
    let slideIndex = 0;
    const track = document.getElementById('track');
    const slides = track.children;
    
    function moveSlide(n) {
      slideIndex = (slideIndex + n + slides.length) % slides.length;
      track.style.transform = `translateX(-${slideIndex * 100}%)`;
    }