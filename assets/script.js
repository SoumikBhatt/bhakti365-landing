document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Theme Toggle (Light / Dark Mode) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn.querySelector('i') || themeToggleBtn;
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon(true);
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon(false);
  }
  
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme === 'dark');
  });
  
  function updateThemeIcon(isDark) {
    if (themeToggleBtn.querySelector('span')) {
      themeToggleBtn.querySelector('span').textContent = isDark ? 'light_mode' : 'dark_mode';
    }
  }

  // --- 2. Scroll Animation (IntersectionObserver) ---
  const scrollElements = document.querySelectorAll('.animate-on-scroll');
  
  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };
  
  const displayScrollElement = (element) => {
    element.classList.add('animated');
  };
  
  const hideScrollElement = (element) => {
    element.classList.remove('animated');
  };
  
  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.15)) {
        displayScrollElement(el);
      }
    });
  };
  
  // Set up observer for modern performance, fallback to scroll event
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target); // Animates once
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    scrollElements.forEach(el => observer.observe(el));
  } else {
    window.addEventListener('scroll', () => { 
      handleScrollAnimation();
    });
    handleScrollAnimation(); // Trigger on load
  }

  // --- 3. Interactive Panchang Widget ---
  const panchangTabs = document.querySelectorAll('.panchang-tab');
  const panchangDateEl = document.getElementById('panchang-date');
  const panchangTithiVal = document.getElementById('panchang-tithi-val');
  const panchangNakshatraVal = document.getElementById('panchang-nakshatra-val');
  const panchangSunriseVal = document.getElementById('panchang-sunrise-val');
  const panchangSunsetVal = document.getElementById('panchang-sunset-val');

  const panchangData = {
    yesterday: {
      date: 'Tuesday, Jul 7, 2026',
      tithi: 'Krishna Saptami',
      nakshatra: 'Uttara Bhadrapada',
      sunrise: '05:28 AM',
      sunset: '07:12 PM'
    },
    today: {
      date: 'Wednesday, Jul 8, 2026 (Today)',
      tithi: 'Krishna Ashtami',
      nakshatra: 'Revati',
      sunrise: '05:29 AM',
      sunset: '07:12 PM'
    },
    tomorrow: {
      date: 'Thursday, Jul 9, 2026',
      tithi: 'Krishna Navami',
      nakshatra: 'Ashwini',
      sunrise: '05:29 AM',
      sunset: '07:11 PM'
    }
  };

  panchangTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active classes
      panchangTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const day = tab.dataset.day;
      const data = panchangData[day];
      
      if (data) {
        // Apply fade out then fade in content
        const cardBody = document.querySelector('.panchang-card-body');
        cardBody.style.opacity = '0';
        cardBody.style.transform = 'translateY(5px)';
        cardBody.style.transition = 'all 0.25s ease';
        
        setTimeout(() => {
          panchangDateEl.textContent = data.date;
          panchangTithiVal.textContent = data.tithi;
          panchangNakshatraVal.textContent = data.nakshatra;
          panchangSunriseVal.textContent = data.sunrise;
          panchangSunsetVal.textContent = data.sunset;
          
          cardBody.style.opacity = '1';
          cardBody.style.transform = 'translateY(0)';
        }, 250);
      }
    });
  });

  // --- 4. Interactive Jap Mala Widget ---
  const malaBeadsCircle = document.getElementById('mala-beads-circle');
  const malaCounter = document.getElementById('mala-counter');
  const malaCountText = document.getElementById('mala-count');
  const malaRoundsText = document.getElementById('mala-rounds-count');
  
  let currentCount = 0;
  let totalRounds = 0;
  const targetCount = 108;
  const numVisualBeads = 18; // 18 beads represents a portion of the mala loop

  // Create visual beads in a circle
  if (malaBeadsCircle) {
    for (let i = 0; i < numVisualBeads; i++) {
      const bead = document.createElement('div');
      bead.classList.add('mala-bead');
      
      // Arrange in a circle
      const angle = (i * 360) / numVisualBeads;
      const radius = 60; // px
      const x = radius * Math.cos((angle * Math.PI) / 180);
      const y = radius * Math.sin((angle * Math.PI) / 180);
      
      bead.style.transform = `translate(${x}px, ${y}px)`;
      bead.dataset.index = i;
      malaBeadsCircle.appendChild(bead);
    }
    
    // Clicking the center counter increments count
    malaCounter.addEventListener('click', incrementMala);
    // Clicking the outer beads also works
    malaBeadsCircle.addEventListener('click', (e) => {
      if (e.target !== malaBeadsCircle && !malaCounter.contains(e.target)) {
        incrementMala();
      }
    });
  }

  function incrementMala() {
    currentCount++;
    
    // Play feedback effects
    malaCounter.classList.add('pulse');
    setTimeout(() => malaCounter.classList.remove('pulse'), 500);
    
    // Active visual beads highlight progression
    const activeIndex = (currentCount - 1) % numVisualBeads;
    const beads = document.querySelectorAll('.mala-bead');
    
    // If it's first bead of a new loop, clear active beads
    if (activeIndex === 0) {
      beads.forEach(bead => bead.className = 'mala-bead');
    }
    
    if (beads[activeIndex]) {
      beads[activeIndex].classList.add('active');
    }
    
    // Check if round completed
    if (currentCount >= targetCount) {
      currentCount = 0;
      totalRounds++;
      malaRoundsText.textContent = totalRounds;
      
      // Pulse animation to the entire widget
      const widget = document.querySelector('.mala-widget-container');
      widget.style.borderColor = 'var(--color-secondary)';
      setTimeout(() => widget.style.borderColor = 'var(--color-border)', 800);
      
      // Highlight all beads briefly
      beads.forEach(bead => bead.classList.add('completed-bead'));
      setTimeout(() => {
        beads.forEach(bead => bead.className = 'mala-bead');
      }, 600);
    }
    
    // Update counter text
    malaCountText.textContent = currentCount;
    
    // Optional: play click sound or minor haptic simulation (browser vibrate)
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  // --- 5. Showcase Horizontal Slider Controls ---
  const showcaseTrack = document.getElementById('showcase-track');
  const prevBtn = document.getElementById('showcase-prev');
  const nextBtn = document.getElementById('showcase-next');
  
  if (showcaseTrack && prevBtn && nextBtn) {
    const scrollAmount = 290; // width + gap
    
    prevBtn.addEventListener('click', () => {
      showcaseTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
      showcaseTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Dynamic control buttons state
    const updateSliderButtons = () => {
      const isAtStart = showcaseTrack.scrollLeft <= 5;
      const isAtEnd = showcaseTrack.scrollLeft >= (showcaseTrack.scrollWidth - showcaseTrack.clientWidth - 5);
      
      prevBtn.style.opacity = isAtStart ? '0.4' : '1';
      prevBtn.style.cursor = isAtStart ? 'default' : 'pointer';
      
      nextBtn.style.opacity = isAtEnd ? '0.4' : '1';
      nextBtn.style.cursor = isAtEnd ? 'default' : 'pointer';
    };
    
    showcaseTrack.addEventListener('scroll', updateSliderButtons);
    // Initial call
    setTimeout(updateSliderButtons, 100);
  }

  // --- 6. FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close other open questions
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
        }
      });
      
      // Toggle current question
      item.classList.toggle('open');
    });
  });

  // Header scroll appearance
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobil Menu Toggle
  const burgerMenuBtn = document.getElementById('burger-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  
  if (burgerMenuBtn && navMenu) {
    burgerMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      burgerMenuBtn.classList.toggle('open');
      // Animate burger menu icon
      const lines = burgerMenuBtn.querySelectorAll('.burger-line');
      if (burgerMenuBtn.classList.contains('open')) {
        lines[0].style.transform = 'translateY(8.5px) rotate(45deg)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'translateY(-8.5px) rotate(-45deg)';
      } else {
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
      }
    });
    
    // Close nav menu on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        burgerMenuBtn.classList.remove('open');
        const lines = burgerMenuBtn.querySelectorAll('.burger-line');
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
      });
    });
  }
});
