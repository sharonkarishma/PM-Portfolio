/* -------------------------------------------------------------
   Sharon Karishma M — PM Portfolio Core Javascript
   Handles client-side routing, theme management, dynamic rendering,
   filters, scroll-snapping slides, and animations.
   ------------------------------------------------------------- */

// Global Application State
const state = {
  activeTheme: 'light',
  teardownFilter: 'All',
  teardownSearch: '',
  mobileMenuOpen: false
};

// Initial Setup
function init() {
  initTheme();
  setupEventListeners();
  router();
}

// -------------------------------------------------------------
// Theme Management
// -------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('pm-portfolio-theme');
  if (savedTheme) {
    state.activeTheme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.activeTheme = 'dark';
  }
  
  applyTheme();
}

function applyTheme() {
  if (state.activeTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }
  localStorage.setItem('pm-portfolio-theme', state.activeTheme);
}

function toggleTheme() {
  state.activeTheme = state.activeTheme === 'light' ? 'dark' : 'light';
  applyTheme();
}

// -------------------------------------------------------------
// Event Listeners Setup
// -------------------------------------------------------------
function setupEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  mobileToggle.addEventListener('click', () => {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    mobileToggle.classList.toggle('open', state.mobileMenuOpen);
    navMenu.classList.toggle('open', state.mobileMenuOpen);
  });

  // Close mobile menu on click of nav link
  navMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      state.mobileMenuOpen = false;
      mobileToggle.classList.remove('open');
      navMenu.classList.remove('open');
    }
  });

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    router();
    window.scrollTo(0, 0);
  });
}

// -------------------------------------------------------------
// Hash Router
// -------------------------------------------------------------
function router() {
  const hash = window.location.hash || '#/';
  const appView = document.getElementById('app-view');
  
  // Show loader
  appView.innerHTML = `
    <div class="loader-view">
      <div class="spinner"></div>
    </div>
  `;

  // Parse path
  const path = parseHash(hash);
  
  // Update Navbar Active States
  updateNavbarActive(path.base);

  // Layout managers: sidebars and breadcrumbs
  manageLayoutBars(path);

  // Render correct view
  setTimeout(() => {
    try {
      if (path.base === '' || path.base === '/') {
        renderHome(appView);
      } else if (path.base === 'about') {
        renderAbout(appView);
      } else if (path.base === 'cases') {
        if (path.sub) {
          renderCaseStudyDetail(appView, path.sub);
        } else {
          renderCasesOverview(appView);
        }
      } else if (path.base === 'teardowns') {
        if (path.sub) {
          renderTeardownDetail(appView, path.sub);
        } else {
          renderTeardownsOverview(appView);
        }
      } else if (path.base === 'frameworks') {
        renderFrameworks(appView);
      } else if (path.base === 'achievements') {
        renderAchievements(appView);
      } else if (path.base === 'contact') {
        renderContact(appView);
      } else {
        render404(appView);
      }
    } catch (err) {
      console.error(err);
      appView.innerHTML = `<div class="error-view"><h3>Error rendering page</h3><p>${err.message}</p></div>`;
    }
  }, 150); // Small delay for smooth loading aesthetic
}

function parseHash(hash) {
  // Remove # and leading/trailing slashes, split by /
  const cleanHash = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  const parts = cleanHash.split('/');
  return {
    raw: hash,
    base: parts[0],
    sub: parts[1] || null
  };
}

function updateNavbarActive(basePath) {
  const links = document.querySelectorAll('.nav-menu .nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href').replace(/^#\/?/, '');
    if (href === basePath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function manageLayoutBars(path) {
  const breadcrumbBar = document.getElementById('breadcrumb-bar');
  const breadcrumbContainer = document.getElementById('breadcrumb-container');
  const caseSidebar = document.getElementById('case-sidebar');
  const mainContent = document.querySelector('.main-content');

  // Breadcrumbs manager
  if (path.base === '' || path.base === '/') {
    breadcrumbBar.classList.add('hidden');
  } else {
    breadcrumbBar.classList.remove('hidden');
    let breadcrumbHTML = `<a href="#/">Home</a>`;
    
    if (path.base === 'about') {
      breadcrumbHTML += `<span class="breadcrumb-separator">></span><span class="breadcrumb-current">About Me</span>`;
    } else if (path.base === 'cases') {
      if (path.sub) {
        const caseName = path.sub === 'cloudrevel' ? 'Cloudrevel' : path.sub === 'hilti' ? 'Hilti India' : 'Walmart BOPIS';
        breadcrumbHTML += `<span class="breadcrumb-separator">></span><a href="#/cases">Case Studies</a><span class="breadcrumb-separator">></span><span class="breadcrumb-current">${caseName}</span>`;
      } else {
        breadcrumbHTML += `<span class="breadcrumb-separator">></span><span class="breadcrumb-current">Case Studies</span>`;
      }
    } else if (path.base === 'teardowns') {
      if (path.sub) {
        const productName = path.sub.charAt(0).toUpperCase() + path.sub.slice(1);
        breadcrumbHTML += `<span class="breadcrumb-separator">></span><a href="#/teardowns">Teardowns</a><span class="breadcrumb-separator">></span><span class="breadcrumb-current">${productName}</span>`;
      } else {
        breadcrumbHTML += `<span class="breadcrumb-separator">></span><span class="breadcrumb-current">Product Teardowns</span>`;
      }
    } else if (path.base === 'frameworks') {
      breadcrumbHTML += `<span class="breadcrumb-separator">></span><span class="breadcrumb-current">Frameworks & Thinking</span>`;
    } else if (path.base === 'achievements') {
      breadcrumbHTML += `<span class="breadcrumb-separator">></span><span class="breadcrumb-current">Achievements</span>`;
    } else if (path.base === 'contact') {
      breadcrumbHTML += `<span class="breadcrumb-separator">></span><span class="breadcrumb-current">Contact</span>`;
    }
    
    breadcrumbContainer.innerHTML = breadcrumbHTML;
  }

  // Case study sub-sidebar controller
  if (path.base === 'cases' && path.sub) {
    caseSidebar.classList.remove('hidden');
    mainContent.classList.add('has-sidebar');
    
    // Highlight active link in sidebar
    const sLinks = caseSidebar.querySelectorAll('.sidebar-link');
    sLinks.forEach(link => {
      if (link.getAttribute('href').includes(path.sub)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  } else {
    caseSidebar.classList.add('hidden');
    mainContent.classList.remove('has-sidebar');
  }
}

// -------------------------------------------------------------
// VIEW RENDERERS
// -------------------------------------------------------------

// 1. Homepage (Dynamic Vertical Slide Deck)
function renderHome(container) {
  container.innerHTML = `
    <div class="snap-container" id="snap-container">
      <!-- Slide 1: Welcome & Pitch -->
      <section class="snap-slide" id="slide-0">
        <div class="slide-grid-2">
          <div class="about-pitch">
            <div class="case-domain-tag">Executive Summary</div>
            <h1 style="font-size: 42px; margin-bottom: 20px;">Sharon Karishma M</h1>
            <div class="editorial-quote" style="margin-top: 0; margin-bottom: 24px;">
              "I build products that scale. I've managed 110+ person teams, launched 3 fintech products from scratch, and identified ₹2.5Cr market opportunities through field-driven research."
            </div>
            <p>I am an aspiring Product Manager and PGP Student at the Indian Institute of Management Visakhapatnam, specialized in translating raw customer friction into highly aligned engineering roadmaps and market strategies.</p>
            <div style="margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="#/about" class="btn btn-primary">Read My Full Story &rarr;</a>
              <button class="btn btn-secondary" onclick="document.getElementById('snap-container').scrollTo({top: document.getElementById('slide-1').offsetTop, behavior: 'smooth'})">View Work Slides &darr;</button>
            </div>
          </div>
          
          <div style="position: relative;">
            <div class="about-avatar" style="margin-bottom: 24px;">
              <div class="avatar-image-container">
                <img src="headshot.jpg" alt="Sharon Karishma M" class="avatar-img">
              </div>
              <h4>Sharon Karishma M</h4>
              <p class="secondary">Business Analyst / Product Owner</p>
              <p class="secondary" style="font-size: 11px; margin-top: 4px;">Graduating Post Graduate Program (PGP) Student at Indian Institute of Management Visakhapatnam</p>
            </div>
            
            <div class="sticky-note">
              <strong>Sharon's Note:</strong> Welcome! This portfolio is structured to showcase real project outcomes and field-verified strategy across fintech, retail, and industrial operations.
            </div>
          </div>
        </div>
      </section>

      <!-- Slide 2: Case Studies -->
      <section class="snap-slide" id="slide-1">
        <div class="slide-header">
          <div class="case-domain-tag">Featured Work</div>
          <h2>Product Case Studies</h2>
          <p class="secondary">Proven capabilities in scaling, strategic reframing, and operational redesign.</p>
        </div>
        <div class="slide-grid-3">
          <div class="tile-card organic-card" onclick="window.location.hash='#/cases/cloudrevel'">
            <div>
              <div class="tile-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="tile-content">
                <h3>Cloudrevel</h3>
                <p class="secondary" style="font-size:11px; text-transform:uppercase; font-weight:600; margin-bottom:8px; color:var(--accent-color);">Scale Story</p>
                <p>Scaling PM processes across 3 fintech products with 110+ engineers, aligning stakeholder priorities, and reducing dev handoff issues.</p>
              </div>
            </div>
            <div class="tile-cta">Read Case Study <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          </div>

          <div class="tile-card organic-card" onclick="window.location.hash='#/cases/hilti'">
            <div>
              <div class="tile-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div class="tile-content">
                <h3>Hilti India</h3>
                <p class="secondary" style="font-size:11px; text-transform:uppercase; font-weight:600; margin-bottom:8px; color:var(--accent-color);">Strategy Story</p>
                <p>Uncovering value chain fragmentation in Chennai M&E market from direct site research, mapping a ₹2.5-3Cr opportunity.</p>
              </div>
            </div>
            <div class="tile-cta">Read Case Study <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          </div>

          <div class="tile-card organic-card" onclick="window.location.hash='#/cases/walmart'">
            <div>
              <div class="tile-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <div class="tile-content">
                <h3>Walmart BOPIS</h3>
                <p class="secondary" style="font-size:11px; text-transform:uppercase; font-weight:600; margin-bottom:8px; color:var(--accent-color);">Execution Story</p>
                <p>Optimizing online-pickup wait times and queue layouts by blending geofenced customer alerts with entrance QR-pickup lockers.</p>
              </div>
            </div>
            <div class="tile-cta">Read Case Study <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          </div>
        </div>
      </section>

      <!-- Slide 3: Product Teardowns -->
      <section class="snap-slide" id="slide-2">
        <div class="slide-header">
          <div class="case-domain-tag">PM Lens</div>
          <h2>Product Teardowns</h2>
          <p class="secondary">Critical evaluation of customer hooks and mechanics across 18+ digital applications.</p>
        </div>
        <div class="slide-grid-3">
          <div class="tile-card organic-card" onclick="window.location.hash='#/teardowns/forest'">
            <div>
              <div class="td-card-header">
                <span class="td-card-name">Forest</span>
                <span class="td-card-tag">Productivity</span>
              </div>
              <p class="td-card-insight">"Crystal-clear purpose + behavioral hooks = meaningful engagement"</p>
            </div>
            <div class="tile-cta">View Teardown <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          </div>

          <div class="tile-card organic-card" onclick="window.location.hash='#/teardowns/blinkist'">
            <div>
              <div class="td-card-header">
                <span class="td-card-name">Blinkist</span>
                <span class="td-card-tag">Productivity</span>
              </div>
              <p class="td-card-insight">"Snackable knowledge delivery tailored to high-intent, low-time professionals."</p>
            </div>
            <div class="tile-cta">View Teardown <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          </div>

          <div class="tile-card organic-card" onclick="window.location.hash='#/teardowns/instagram'">
            <div>
              <div class="td-card-header">
                <span class="td-card-name">Instagram</span>
                <span class="td-card-tag">Consumer</span>
              </div>
              <p class="td-card-insight">"Continuous feed evolution: balancing user control with algorithmic discovery."</p>
            </div>
            <div class="tile-cta">View Teardown <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 24px; flex-wrap:wrap; gap: 16px;">
          <a href="#/teardowns" class="btn btn-primary">Browse All 18+ Teardowns &rarr;</a>
          <div class="sticky-note" style="margin: 0; max-width: 400px; transform: rotate(1deg);">
            <strong>Analysis Habit:</strong> Doing continuous product analysis keeps my PM skills sharp. It is my preferred method to discover new UX solutions.
          </div>
        </div>
      </section>

      <!-- Slide 4: Frameworks -->
      <section class="snap-slide" id="slide-3">
        <div class="slide-grid-2">
          <div>
            <div class="case-domain-tag">Methodology</div>
            <h2>Pillars & Frameworks</h2>
            <div class="editorial-quote">
              "Anticipate emotion, identify root causes, design for systemic interdependencies."
            </div>
            <p>I apply a structured 5-step PM framework to diagnose product structures, establish metrics, and unlock market margins.</p>
            <div style="margin-top: 24px;">
              <a href="#/frameworks" class="btn btn-primary">Review Framework & Test Wizard &rarr;</a>
            </div>
          </div>
          
          <div class="sub-list" style="gap: 16px;">
            <div class="competency-item">
              <h5 style="color: var(--accent-color);">1. Field-Driven Research</h5>
              <p>Gathering qualitative observations straight from construction sites and retail stores.</p>
            </div>
            <div class="competency-item">
              <h5 style="color: var(--accent-color);">2. Systemic Reframing</h5>
              <p>Diagnosing underlying specification gaps instead of defaulting to pricing discounts.</p>
            </div>
            <div class="competency-item">
              <h5 style="color: var(--accent-color);">3. Systems Thinking</h5>
              <p>Accounting for how digital systems interact with physical workflows and staff incentives.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Slide 5: Achievements -->
      <section class="snap-slide" id="slide-4">
        <div class="slide-header">
          <div class="case-domain-tag">Metrics Ledger</div>
          <h2>Achievements & Numbers</h2>
          <p class="secondary">Quantified ledger of key results obtained across product roles.</p>
        </div>
        <div class="slide-grid-3">
          <div class="tile-card organic-card" onclick="window.location.hash='#/achievements'">
            <div class="md-card-num">6+</div>
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">Products Delivered</h3>
              <p class="secondary" style="font-size: 13px;">Coordinated multi-functional teams for end-to-end release of business, banking, foodtech, and fintech suites.</p>
            </div>
          </div>
          <div class="tile-card organic-card" onclick="window.location.hash='#/achievements'">
            <div class="md-card-num">₹2.5-3Cr</div>
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">Market TAM Validated</h3>
              <p class="secondary" style="font-size: 13px;">Mapped and validated for commercial overhead segments during Hilti consulting.</p>
            </div>
          </div>
          <div class="tile-card organic-card" onclick="window.location.hash='#/achievements'">
            <div class="md-card-num">92%</div>
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">User Satisfaction</h3>
              <p class="secondary" style="font-size: 13px;">Achieved during field testing for fintech services in rural pilot accounts.</p>
            </div>
          </div>
        </div>
        <div style="margin-top: 24px; display: flex; justify-content:space-between; align-items: center; flex-wrap:wrap; gap: 16px;">
          <a href="#/achievements" class="btn btn-secondary">Open Impact Dashboard &rarr;</a>
          <div class="sticky-note" style="margin:0; transform: rotate(-1deg);">
            <strong>Verify:</strong> All metrics listed on this dashboard are backed by audited project results and direct client surveys.
          </div>
        </div>
      </section>

      <!-- Slide 6: Contact -->
      <section class="snap-slide" id="slide-5">
        <div class="slide-grid-2">
          <div>
            <div class="case-domain-tag">Get in Touch</div>
            <h2>Let's Collaborate</h2>
            <p>If you are looking to scale product operations, optimize user conversion rates, or design market expansion models, let's connect.</p>
            
            <div class="sticky-note" style="margin: 24px 0;">
              "Let's talk about: Product strategy, market research, cross-functional leadership, your next great product"
            </div>
            
            <div style="margin-top: 24px;">
              <a href="#/contact" class="btn btn-primary">Go to Contact Info &rarr;</a>
            </div>
          </div>
          
          <div class="about-avatar" style="padding: 40px; text-align: left; align-items: start;">
            <h4 style="font-size: 22px; margin-bottom: 8px;">Sharon Karishma M</h4>
            <p style="font-size: 14px; margin-bottom: 12px; color: var(--accent-color); font-weight:600;">sharon.karishma25-01@iimv.ac.in</p>
            <p style="font-size: 14px; margin-bottom: 16px;">+91 8778254526</p>
            <a href="https://www.linkedin.com/in/sharon-karishma-m-a991b21ab/" target="_blank" class="btn btn-secondary" style="width: 100%;">Connect on LinkedIn</a>
          </div>
        </div>
      </section>
    </div>

    <!-- Vertical Dots Navigation (Visible on desktop) -->
    <div class="slide-indicator-dots" id="home-slide-dots">
      <div class="slide-dot active" data-slide="0" title="Summary"></div>
      <div class="slide-dot" data-slide="1" title="Case Studies"></div>
      <div class="slide-dot" data-slide="2" title="Teardowns"></div>
      <div class="slide-dot" data-slide="3" title="Philosophy"></div>
      <div class="slide-dot" data-slide="4" title="Impact Metrics"></div>
      <div class="slide-dot" data-slide="5" title="Contact"></div>
    </div>
  `;

  // Attach event handlers for the slide indicator dots
  const containerEl = document.getElementById('snap-container');
  const dots = document.querySelectorAll('.slide-dot');

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = e.target.dataset.slide;
      const targetSlide = document.getElementById(`slide-${idx}`);
      if (targetSlide && containerEl) {
        // Scroll snap container to the slide
        containerEl.scrollTo({
          top: targetSlide.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Track scrolling inside snap container to update active dot
  if (containerEl) {
    containerEl.addEventListener('scroll', () => {
      const scrollPos = containerEl.scrollTop;
      const height = containerEl.clientHeight;
      const activeIndex = Math.round(scrollPos / height);

      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    });
  }
}

// 2. About Me Page
function renderAbout(container) {
  const data = PORTFOLIO_DATA.about;

  // Render pitch and general statistics glance
  let metricsGlanceHTML = '';
  data.metrics.slice(0, 4).forEach(m => {
    metricsGlanceHTML += `
      <div class="about-metric-card organic-card">
        <div class="about-metric-val">${m.label}</div>
        <div class="about-metric-lbl">${m.sublabel}</div>
      </div>
    `;
  });

  // Horizontal roadmap nodes
  let timelineNodesHTML = '';
  data.timeline.forEach((node, index) => {
    timelineNodesHTML += `
      <div class="timeline-node">
        <div class="timeline-dot-marker"></div>
        <div class="timeline-year">${node.year}</div>
        <div class="timeline-role">${node.milestone}</div>
        <div class="timeline-popover">
          <div class="timeline-pop-title">${node.title}</div>
          <p style="font-size:11px; margin-bottom:0; color:var(--text-color);">${node.desc}</p>
        </div>
      </div>
    `;
  });

  // Short bio list
  let bioHTML = '';
  data.bio.forEach(p => {
    bioHTML += `<p>${p}</p>`;
  });

  // Competency tags
  let competencyHTML = '';
  data.competencies.forEach(comp => {
    competencyHTML += `
      <div class="competency-item">
        <h5>${comp.name}</h5>
        <p>${comp.desc}</p>
      </div>
    `;
  });

  // Strengths list
  let strengthsHTML = '';
  data.strengths.forEach(str => {
    strengthsHTML += `
      <div class="strength-item">
        <h5>${str.name}</h5>
        <p>${str.desc}</p>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="about-hero">
      <div class="about-pitch">
        <div class="case-domain-tag">About Sharon</div>
        <h1 style="font-size: 34px; line-height: 1.35; font-weight: 600; font-family: var(--font-serif); margin-bottom: 28px; color: var(--text-color);">
          ${data.pitch}
        </h1>
        ${bioHTML}
      </div>
      <div class="about-avatar" style="flex-direction: column; align-items: center; justify-content: center;">
        <div class="avatar-image-container">
          <img src="headshot.jpg" alt="Sharon Karishma M" class="avatar-img">
        </div>
        <div class="avatar-info" style="text-align: center;">
          <h4>Sharon Karishma M</h4>
          <p>Business Analyst / Product Owner</p>
          <p class="secondary">Graduating Post Graduate Program (PGP) Student at Indian Institute of Management Visakhapatnam</p>
        </div>
      </div>
    </div>

    <!-- Key Metrics Glance -->
    <h2>Impact at a Glance</h2>
    <div class="about-metrics-glance">
      ${metricsGlanceHTML}
    </div>

    <!-- Skills Section ("Signal, not noise") -->
    <div class="skills-section">
      <div class="skills-intro">
        <h2>Signal, not noise</h2>
      </div>
      <div class="skills-grid-4">
        <div class="skills-col">
          <h4>Product</h4>
          <ul class="skills-list">
            <li>Product Strategy & Roadmap</li>
            <li>PRD & User Stories</li>
            <li>User Research & Interviews</li>
            <li>Prioritization (RICE, PIF)</li>
            <li>A/B Testing Design</li>
            <li>Agile / Scrum</li>
          </ul>
        </div>
        <div class="skills-col">
          <h4>Technical</h4>
          <ul class="skills-list">
            <li>Gen AI Architecture</li>
            <li>RAG Pipelines</li>
            <li>Prompt Engineering</li>
            <li>Fine-Tuning</li>
            <li>Context Engineering</li>
            <li>SQL & Data Analysis</li>
          </ul>
        </div>
        <div class="skills-col">
          <h4>Tools</h4>
          <ul class="skills-list">
            <li>Jira</li>
            <li>Figma</li>
            <li>Notion</li>
            <li>Confluence</li>
            <li>ServiceNow</li>
            <li>Claude / ChatGPT</li>
          </ul>
        </div>
        <div class="skills-col">
          <h4>Soft Skills</h4>
          <ul class="skills-list">
            <li>Cross-functional Leadership</li>
            <li>Stakeholder Communication</li>
            <li>Root Cause Analysis</li>
            <li>Data-Driven Decisions</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Journey Roadmap Timeline -->
    <div class="timeline-section" style="position:relative;">
      <h2>Career Timeline</h2>
      <div class="horizontal-timeline">
        ${timelineNodesHTML}
      </div>
      
      <div class="sticky-note" style="margin-top: 24px; max-width: 500px;">
        <strong>Background Note:</strong> Starting from engineering, I transitioned to Cloudrevel managing scale and Hilti solving B2B strategy. Each step built a foundation of systems thinking.
      </div>
    </div>

    <!-- Accordion Expandable Sections -->
    <div class="accordion-wrapper">
      <!-- Competencies -->
      <div class="accordion-item" id="accordion-comp">
        <button class="accordion-header" onclick="toggleAccordion('accordion-comp')">
          <span>Key Competencies</span>
          <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="accordion-content">
          <div class="competency-grid">${competencyHTML}</div>
        </div>
      </div>

      <!-- Strengths -->
      <div class="accordion-item" id="accordion-strengths">
        <button class="accordion-header" onclick="toggleAccordion('accordion-strengths')">
          <span>Distinctive Strengths</span>
          <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="accordion-content">
          <div class="strengths-list">${strengthsHTML}</div>
        </div>
      </div>

      <!-- Full Experience Resume -->
      <div class="accordion-item" id="accordion-resume">
        <button class="accordion-header" onclick="toggleAccordion('accordion-resume')">
          <span>Professional Experience Summary</span>
          <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="accordion-content">
          <div class="sub-list">
            <div class="sub-list-item">
              <span class="item-meta">2026 - Present</span>
              <h5>PGP Student & Placement Representative @ Indian Institute of Management Visakhapatnam</h5>
              <p>Driving institutional corporate relations, placing 100+ graduates across top-tier firms. Applying advanced strategy and financial modeling frameworks to product scenarios.</p>
            </div>
            <div class="sub-list-item">
              <span class="item-meta">Summer 2026</span>
              <h5>Product Strategy Intern @ Hilti India</h5>
              <p>Addressed commercial overhead anchoring sales flatlines. Conducted site visits (10+ sites, 34 accounts) to uncover value chain fragmentation and designed Chennai entry playbook with ₹2.5-3Cr potential.</p>
            </div>
            <div class="sub-list-item">
              <span class="item-meta">2023 - 2025</span>
              <h5>Business Analyst / Product Owner @ Cloudrevel Innovations</h5>
              <p>Managed three digital payment products, taking on the Product Owner role to drive requirements and backlog. Scaled platform infrastructure with a 110+ engineering team, improving handoff efficiency by 40% and deploying fully audit-compliant services.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleAccordion(itemId) {
  const item = document.getElementById(itemId);
  if (item) {
    item.classList.toggle('open');
  }
}

// 3. Case Studies Overview Page
function renderCasesOverview(container) {
  const keys = Object.keys(PORTFOLIO_DATA.cases);
  let gridHTML = '';

  keys.forEach(k => {
    const item = PORTFOLIO_DATA.cases[k];
    gridHTML += `
      <div class="case-preview-card organic-card">
        <div class="case-preview-badge">
          <div class="badge-name">${item.name}</div>
          <div class="badge-domain">${item.domain}</div>
        </div>
        <div class="case-preview-body">
          <div>
            <h3>${item.title}</h3>
            <p>${item.hook}</p>
          </div>
          <div>
            <a href="#/cases/${item.slug}" class="btn btn-primary">Read Case Study</a>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="cases-hero">
      <div class="case-domain-tag">Portfolio Studies</div>
      <h1>Product Case Studies</h1>
      <p class="secondary">Quantitative proofs of ability across fintech platforms, market expansion consulting, and omnichannel operation execution.</p>
    </div>
    <div class="case-card-grid">
      ${gridHTML}
    </div>
  `;
}

// 4. Case Study Detail Page
function renderCaseStudyDetail(container, caseSlug) {
  const cData = PORTFOLIO_DATA.cases[caseSlug];
  if (!cData) {
    render404(container);
    return;
  }

  // Generate cards
  let cardsHTML = '';
  cData.cards.forEach(card => {
    let innerContent = '';
    
    // Check fields of details to display dynamically
    if (card.details.problem) {
      innerContent += `<p><strong>Problem:</strong> ${card.details.problem}</p>`;
    }
    if (card.details.constraints) {
      innerContent += `<p><strong>Constraints:</strong> ${card.details.constraints}</p>`;
    }
    if (card.details.methodology) {
      innerContent += `
        <p><strong>Methodology:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.methodology.map(m => `<li>${m}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.insights) {
      innerContent += `
        <p><strong>Key Research Insights:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.insights.map(i => `<li>${i}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.initiatives) {
      innerContent += `
        <p><strong>Solutions:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.initiatives.map(i => `<li>${i}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.projections) {
      innerContent += `
        <p><strong>Quantified Forecast:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.projections.map(p => `<li>${p}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.items) {
      innerContent += `
        <p><strong>Deliverables:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.phases) {
      innerContent += `
        <p><strong>Solution Architecture:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.phases.map(p => `<li>${p}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.targets) {
      innerContent += `
        <p><strong>KPI Benchmarks:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.targets.map(t => `<li>${t}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.metrics) {
      innerContent += `
        <p><strong>Quantified Outcomes:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.metrics.map(m => `<li>${m}</li>`).join('')}
        </ul>
      `;
    }
    if (card.details.takeaways) {
      innerContent += `
        <p><strong>Key Takeaways:</strong></p>
        <ul style="margin-bottom:16px;">
          ${card.details.takeaways.map(t => `<li>${t}</li>`).join('')}
        </ul>
      `;
    }

    cardsHTML += `
      <div class="collapsible-card" id="card-${card.id}">
        <button class="collapsible-header" onclick="toggleCaseCard('card-${card.id}')">
          <div class="collapsible-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>${card.title}</span>
          </div>
          <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="collapsible-body">
          <div class="collapsible-inner">
            <div class="collapsible-summary">${card.summary}</div>
            <div class="collapsible-details">
              ${innerContent}
            </div>
            <div class="collapsible-expandable">
              <div class="collapsible-expandable-title">Deep Dive Detail</div>
              <p style="font-size:13px; color:var(--text-color); margin-bottom:0;">${card.details.expandableContent}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // Back/Next links
  const slugs = Object.keys(PORTFOLIO_DATA.cases);
  const currentIdx = slugs.indexOf(caseSlug);
  const prevSlug = currentIdx > 0 ? slugs[currentIdx - 1] : null;
  const nextSlug = currentIdx < slugs.length - 1 ? slugs[currentIdx + 1] : null;

  let footerNavHTML = '';
  if (prevSlug) {
    const prevName = PORTFOLIO_DATA.cases[prevSlug].name;
    footerNavHTML += `<a href="#/cases/${prevSlug}" class="btn btn-secondary">&larr; ${prevName}</a>`;
  } else {
    footerNavHTML += `<div></div>`;
  }
  
  if (nextSlug) {
    const nextName = PORTFOLIO_DATA.cases[nextSlug].name;
    footerNavHTML += `<a href="#/cases/${nextSlug}" class="btn btn-primary">${nextName} &rarr;</a>`;
  } else {
    footerNavHTML += `<a href="#/teardowns" class="btn btn-primary">Browse Teardowns &rarr;</a>`;
  }

  container.innerHTML = `
    <div class="case-study-header">
      <div class="case-domain-tag">${cData.domain}</div>
      <h1 class="case-study-title">${cData.name} Study</h1>
      <p class="case-study-desc">"${cData.title}"</p>
    </div>

    <!-- Personal Commentary Sticky Note (Human Touch) -->
    <div class="sticky-note" style="margin-bottom: 32px;">
      <strong>Sharon's Context:</strong> This case study highlights my focus on uncovering systemic root causes and ecosystem incentives before committing engineering resources.
    </div>

    <div class="case-cards-container">
      ${cardsHTML}
    </div>

    <div class="case-footer-nav">
      ${footerNavHTML}
    </div>
  `;

  // Auto-expand first card for quick reading engagement
  setTimeout(() => {
    const firstCard = container.querySelector('.collapsible-card');
    if (firstCard) {
      firstCard.classList.add('open');
    }
  }, 100);
}

function toggleCaseCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.toggle('open');
  }
}

// 5. Product Teardowns Browse Page
function renderTeardownsOverview(container) {
  container.innerHTML = `
    <div class="cases-hero">
      <div class="case-domain-tag">Analysis Catalog</div>
      <h1>Product Teardowns</h1>
      <p class="secondary">Critical evaluation of 18 digital consumer and B2B products. Mapping user hooks, interface mechanics, and strategic takeaways.</p>
    </div>

    <!-- Search & Filter Controls -->
    <div class="teardown-controls">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="td-search" class="search-input" placeholder="Search by product, category, or domain..." value="${state.teardownSearch}">
      </div>
      <div class="filter-group" id="td-filters">
        <button class="filter-btn ${state.teardownFilter === 'All' ? 'active' : ''}" data-filter="All">All</button>
        <button class="filter-btn ${state.teardownFilter === 'Consumer' ? 'active' : ''}" data-filter="Consumer">Consumer</button>
        <button class="filter-btn ${state.teardownFilter === 'B2B SaaS' ? 'active' : ''}" data-filter="B2B SaaS">B2B SaaS</button>
        <button class="filter-btn ${state.teardownFilter === 'FinTech' ? 'active' : ''}" data-filter="FinTech">FinTech</button>
        <button class="filter-btn ${state.teardownFilter === 'Retail' ? 'active' : ''}" data-filter="Retail">Retail</button>
        <button class="filter-btn ${state.teardownFilter === 'Productivity' ? 'active' : ''}" data-filter="Productivity">Productivity</button>
        <button class="filter-btn ${state.teardownFilter === 'Health' ? 'active' : ''}" data-filter="Health">Health</button>
      </div>
    </div>

    <div class="teardowns-grid" id="teardowns-grid-container">
      <!-- Generated dynamically -->
    </div>
  `;

  // Render grid list
  renderTeardownsGrid();

  // Attach search listeners
  const searchInput = document.getElementById('td-search');
  searchInput.addEventListener('input', (e) => {
    state.teardownSearch = e.target.value;
    renderTeardownsGrid();
  });

  // Attach filter buttons listener
  const filterGroup = document.getElementById('td-filters');
  filterGroup.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      // Toggle active states
      filterGroup.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      state.teardownFilter = e.target.dataset.filter;
      renderTeardownsGrid();
    }
  });
}

function renderTeardownsGrid() {
  const gridContainer = document.getElementById('teardowns-grid-container');
  if (!gridContainer) return;

  const searchLower = state.teardownSearch.toLowerCase();
  
  // Filter products
  const filtered = PORTFOLIO_DATA.teardowns.filter(td => {
    const matchesFilter = state.teardownFilter === 'All' || td.category === state.teardownFilter || td.domain === state.teardownFilter;
    const matchesSearch = td.name.toLowerCase().includes(searchLower) || td.category.toLowerCase().includes(searchLower) || td.domain.toLowerCase().includes(searchLower) || td.insight.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    gridContainer.innerHTML = `<div style="grid-column: span 3; text-align:center; padding:48px 0; color:var(--secondary-color);">No teardowns found matching criteria.</div>`;
    return;
  }

  let cardsHTML = '';
  filtered.forEach(td => {
    cardsHTML += `
      <div class="teardown-preview-card organic-card" onclick="window.location.hash='#/teardowns/${td.name.toLowerCase()}'">
        <div>
          <div class="td-card-header">
            <span class="td-card-name">${td.name}</span>
            <span class="td-card-tag">${td.category}</span>
          </div>
          <p class="td-card-insight">"${td.insight}"</p>
        </div>
        <div class="tile-cta">View Deep Dive <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
      </div>
    `;
  });

  gridContainer.innerHTML = cardsHTML;
}

// 6. Product Teardown Detail Page
function renderTeardownDetail(container, productName) {
  const td = PORTFOLIO_DATA.teardowns.find(item => item.name.toLowerCase() === productName.toLowerCase());
  if (!td) {
    render404(container);
    return;
  }

  // Generate User Flow (Simplified representation)
  let flowHTML = '';
  if (td.sections.howItWorks.flow) {
    const steps = td.sections.howItWorks.flow.split('->').map(s => s.trim());
    flowHTML = `
      <div class="flow-diagram-wrapper">
        ${steps.map((step, idx) => `
          <div class="flow-step" onclick="alert('Step detail: ${step}')">${step}</div>
          ${idx < steps.length - 1 ? '<span class="flow-arrow">&rarr;</span>' : ''}
        `).join('')}
      </div>
    `;
  }

  // Generate 3 core highlights
  let greatnessHTML = '';
  td.sections.greatness.forEach(item => {
    greatnessHTML += `
      <div class="td-greatness-item">
        <h5>${item.title}</h5>
        <p>${item.desc}</p>
      </div>
    `;
  });

  // Prev / Next routing
  const list = PORTFOLIO_DATA.teardowns;
  const currentIdx = list.findIndex(item => item.name === td.name);
  const prevItem = currentIdx > 0 ? list[currentIdx - 1] : null;
  const nextItem = currentIdx < list.length - 1 ? list[currentIdx + 1] : null;

  let teardownNavHTML = '';
  if (prevItem) {
    teardownNavHTML += `<a href="#/teardowns/${prevItem.name.toLowerCase()}" class="btn btn-secondary">&larr; ${prevItem.name}</a>`;
  } else {
    teardownNavHTML += `<div></div>`;
  }
  teardownNavHTML += `<a href="#/teardowns" class="btn btn-secondary">All Teardowns</a>`;
  if (nextItem) {
    teardownNavHTML += `<a href="#/teardowns/${nextItem.name.toLowerCase()}" class="btn btn-primary">${nextItem.name} &rarr;</a>`;
  } else {
    teardownNavHTML += `<a href="#/frameworks" class="btn btn-primary">Thinking &rarr;</a>`;
  }

  container.innerHTML = `
    <div class="teardown-detail-header">
      <div class="teardown-nav">
        <div class="case-domain-tag">${td.category} | ${td.domain}</div>
      </div>
      <h1 style="margin-bottom:8px;">${td.name} Teardown</h1>
      <p class="td-header-insight">"${td.insight}"</p>
    </div>

    <div class="teardown-grid-layout">
      <!-- Main Content Sections -->
      <div class="teardown-sections">
        <!-- 1. The Observation -->
        <div class="teardown-section-card organic-card">
          <h4>Section 1: The Observation</h4>
          <p>${td.sections.observation.story}</p>
          <div class="interactive-hint-box" onclick="toggleHint('obs-context')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>Click to reveal background context</span>
          </div>
          <div class="interactive-detail-content" id="obs-context">
            ${td.sections.observation.context}
          </div>
        </div>

        <!-- 2. The Problem It Solves -->
        <div class="teardown-section-card organic-card">
          <h4>Section 2: The Problem It Solves</h4>
          <p><strong>Core Pain Point:</strong> ${td.sections.problem.painpoint}</p>
          <p><strong>Market Alternatives:</strong> ${td.sections.problem.alternatives}</p>
          <div class="interactive-hint-box" onclick="toggleHint('prob-opp')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>Click to view Strategic Opportunity Mapping</span>
          </div>
          <div class="interactive-detail-content" id="prob-opp">
            ${td.sections.problem.opportunity}
          </div>
        </div>

        <!-- 3. How It Works -->
        <div class="teardown-section-card organic-card">
          <h4>Section 3: How It Works (PM Lens)</h4>
          <p>${td.sections.howItWorks.mechanics}</p>
          <p><strong>User Flow Navigation:</strong></p>
          ${flowHTML}
          <p><strong>Core Differentiator:</strong> ${td.sections.howItWorks.differentiators}</p>
        </div>

        <!-- 4. What Makes It Great -->
        <div class="teardown-section-card organic-card">
          <h4>Section 4: What Makes It Great (Insights)</h4>
          <div class="td-greatness-list">
            ${greatnessHTML}
          </div>
        </div>

        <!-- 5. Product Takeaway -->
        <div class="teardown-section-card organic-card">
          <h4>Section 5: PM Takeaways</h4>
          <p>${td.sections.takeaway}</p>
          <div class="interactive-hint-box" onclick="toggleHint('takeaway-notes')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>Click to inspect Sharon's Personal Notes</span>
          </div>
          <div class="interactive-detail-content" id="takeaway-notes">
            <em>"When analyzing ${td.name}, it becomes evident that product success isn't driven by how many features you can fit in, but by how well you align UI incentives with deep psychological user states. In B2B or complex domains, this translates to designing workflows that respect user cognitive budgets."</em>
          </div>
        </div>
      </div>

      <!-- Sidebar cards -->
      <div class="teardown-sidebar">
        <div class="teardown-sidebar-card organic-card">
          <h4>Related Suggestion</h4>
          <p>If you're studying ${td.name}, you might also be interested in:</p>
          <a href="#/teardowns/${td.sections.related.toLowerCase()}" class="btn btn-primary">${td.sections.related} Teardown</a>
        </div>
        
        <div class="sticky-note" style="margin-top: 24px; transform: rotate(-2deg);">
          <strong>Sharon's Take:</strong> Notice how ${td.name} creates emotional engagement. In my PM practice, I design to respect attention constraints and avoid feature clutter.
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="case-footer-nav" style="margin-top:40px;">
      ${teardownNavHTML}
    </div>
  `;
}

function toggleHint(hintId) {
  const panel = document.getElementById(hintId);
  if (panel) {
    panel.classList.toggle('show');
  }
}

// 7. Frameworks & Thinking Page
function renderFrameworks(container) {
  const fData = PORTFOLIO_DATA.framework;

  // Pillars list
  let pillarsHTML = '';
  fData.philosophy.pillars.forEach((p, idx) => {
    pillarsHTML += `
      <div class="pillar-card organic-card">
        <div>
          <div class="pillar-num">Pillar 0${idx+1}</div>
          <h3 class="pillar-title">${p.title}</h3>
          <div class="pillar-subtitle">${p.subtitle}</div>
          <p class="pillar-body">${p.core}</p>
        </div>
        <div class="pillar-example">
          <strong>Applied:</strong> ${p.example}
        </div>
      </div>
    `;
  });

  // 5 Step rows
  let stepsHTML = '';
  fData.applied.steps.forEach(step => {
    stepsHTML += `
      <div class="step-row">
        <div class="step-number-circle">${step.num}</div>
        <div class="step-details-card organic-card">
          <h4>${step.name}</h4>
          <div class="step-question">"${step.question}"</div>
          <div class="step-inner-grid">
            <div class="step-example-block">
              <h5>Applied Case Reference</h5>
              <p>${step.example}</p>
            </div>
            <div class="step-tools-block">
              <h5>PM Diagnostics & Tools</h5>
              <div class="step-tools-list">
                ${step.tools.map(t => `<span class="step-tool-badge">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="framework-intro">
      <div class="case-domain-tag">PM Philosophy</div>
      <h1>Frameworks & Applied Thinking</h1>
      <p class="secondary">A disciplined approach to product diagnostics, centering on field discovery and systems evaluation.</p>
    </div>

    <!-- Section 1: Philosophy -->
    <h2>Section 1: PM Philosophy</h2>
    <p style="font-size:18px; font-weight:500; border-left:4px solid var(--accent-color); padding-left:20px; margin-bottom:32px; font-style:italic; font-family: var(--font-serif);">
      "${fData.philosophy.belief}"
    </p>

    <div class="framework-pillars">
      ${pillarsHTML}
    </div>

    <!-- Section 2: Applied Framework -->
    <div class="applied-framework-section">
      <h2>Section 2: The 5-Step Applied Framework</h2>
      <p class="secondary" style="margin-bottom:32px;">How Sharon breaks down systemic constraints, unlocks opportunities, and maps measurable execution outcomes.</p>
      
      <div class="steps-container">
        ${stepsHTML}
      </div>
    </div>

    <!-- Section 3: Expandable walkthroughs -->
    <h2>Case Study Walkthroughs</h2>
    <div class="accordion-wrapper">
      <div class="accordion-item" id="acc-fw-cloudrevel">
        <button class="accordion-header" onclick="toggleAccordion('acc-fw-cloudrevel')">
          <span>Walkthrough: Cloudrevel scaling operations</span>
          <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="accordion-content">
          <p>${fData.applied.walkthroughs.cloudrevel.details}</p>
        </div>
      </div>

      <div class="accordion-item" id="acc-fw-hilti">
        <button class="accordion-header" onclick="toggleAccordion('acc-fw-hilti')">
          <span>Walkthrough: Hilti India regional market entry</span>
          <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="accordion-content">
          <p>${fData.applied.walkthroughs.hilti.details}</p>
        </div>
      </div>

      <div class="accordion-item" id="acc-fw-walmart">
        <button class="accordion-header" onclick="toggleAccordion('acc-fw-walmart')">
          <span>Walkthrough: Walmart BOPIS queue optimization</span>
          <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="accordion-content">
          <p>${fData.applied.walkthroughs.walmart.details}</p>
        </div>
      </div>
    </div>

    <!-- Section 4: Dynamic Interactive Wizard (Test the Framework) -->
    <div id="framework-wizard-mount"></div>
  `;

  // Mount Framework Tester Wizard
  if (window.FrameworkWizard) {
    window.FrameworkWizard.mount('framework-wizard-mount');
  }
}

// 8. Achievements Dashboard Page
function renderAchievements(container) {
  const ach = PORTFOLIO_DATA.achievements;

  // Generate visual dashboard metric cards
  let metricsHTML = '';
  ach.metrics.forEach((m, idx) => {
    metricsHTML += `
      <div class="metric-dashboard-card organic-card" id="metric-card-${idx}" onclick="toggleMetricCard('metric-card-${idx}')">
        <div>
          <div class="md-card-num">${m.num}</div>
          <div class="md-card-label">${m.label}</div>
        </div>
        <div>
          <div class="md-card-context">${m.context}</div>
          <div class="metric-detail-popover">
            ${m.desc || 'Direct verified impact. Key result indicator supporting business scale objectives.'}
          </div>
        </div>
      </div>
    `;
  });

  // Awards list
  let awardsHTML = '';
  ach.awards.forEach(item => {
    awardsHTML += `
      <div class="sub-list-item">
        <span class="item-meta">${item.org} | ${item.date}</span>
        <h5>${item.title}</h5>
        <p>${item.desc}</p>
      </div>
    `;
  });

  // Certifications list
  let certsHTML = '';
  ach.certifications.forEach(c => {
    certsHTML += `
      <div class="sub-list-item" style="border-bottom: 1px solid var(--border-color); padding-bottom:12px;">
        <h5>${c.name}</h5>
        <p class="secondary">${c.issuer}</p>
      </div>
    `;
  });

  // Extra-curricular
  let extraHTML = '';
  ach.extraCurricular.forEach(item => {
    extraHTML += `
      <div class="sub-list-item">
        <span class="item-meta">${item.type}</span>
        <h5>${item.title}</h5>
        <p>${item.desc}</p>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="achievements-hero">
      <div class="case-domain-tag">Impact Ledger</div>
      <h1>Achievements & Metrics</h1>
      <p class="secondary">A visual dashboard documenting quantified outcomes, academic honors, professional certifications, and creative works.</p>
    </div>

    <!-- Section 1: Dashboard metrics -->
    <h2>Section 1: By The Numbers</h2>
    <div class="metrics-dashboard-grid">
      ${metricsHTML}
    </div>

    <!-- Section 2 & 3: Awards, Certifications & Creative Output -->
    <div class="achievement-subs-grid">
      <!-- Left side: Awards & Creative Output -->
      <div class="achievement-column">
        <div class="achievement-sub-card organic-card" style="margin-bottom: 24px;">
          <h3>Awards & Recognition</h3>
          <div class="sub-list">
            ${awardsHTML}
          </div>
        </div>

        <div class="achievement-sub-card organic-card">
          <h3>Creative & Extracurricular</h3>
          <div class="sub-list">
            ${extraHTML}
          </div>
        </div>
      </div>

      <!-- Right side: Certifications -->
      <div class="achievement-column">
        <div class="achievement-sub-card organic-card" style="height: 100%;">
          <h3>Certifications</h3>
          <div class="sub-list">
            ${certsHTML}
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleMetricCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.toggle('expanded');
  }
}

// 9. Contact / Call to Action Page
function renderContact(container) {
  const c = PORTFOLIO_DATA.contact;
  
  // Format mailto template
  const mailtoURL = `mailto:${c.email}?subject=${encodeURIComponent(c.prefilledEmail.subject)}&body=${encodeURIComponent(c.prefilledEmail.body)}`;

  container.innerHTML = `
    <div class="cases-hero" style="margin-bottom: 24px;">
      <div class="case-domain-tag">Connect</div>
      <h1>Contact Information</h1>
      <p class="secondary">Let's talk about product strategy, market entry research, and cross-functional leadership.</p>
    </div>

    <div class="contact-layout">
      <!-- Contact card -->
      <div class="contact-card-box organic-card">
        <h3>Sharon Karishma M</h3>
        <p class="contact-pitch-line">"${c.cta}"</p>
        
        <div class="contact-methods">
          <!-- Email -->
          <div class="contact-item">
            <div class="contact-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div class="contact-item-details">
              <span>Email</span>
              <a href="${mailtoURL}">${c.email}</a>
            </div>
          </div>

          <!-- Phone -->
          <div class="contact-item">
            <div class="contact-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div class="contact-item-details">
              <span>Phone</span>
              <span>${c.phone}</span>
            </div>
          </div>

          <!-- LinkedIn -->
          <div class="contact-item">
            <div class="contact-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </div>
            <div class="contact-item-details">
              <span>LinkedIn</span>
              <a href="${c.linkedin}" target="_blank">linkedin.com/in/sharon-karishma</a>
            </div>
          </div>
        </div>

        <div class="contact-ctas" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
          <div style="display: flex; gap: 12px; width: 100%;">
            <a href="${mailtoURL}" class="btn btn-primary" style="flex: 1;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email Sharon
            </a>
            <button class="btn btn-secondary" style="flex: 1;" onclick="navigator.clipboard.writeText('${c.email}'); alert('Email copied to clipboard!');">Copy Email Address</button>
          </div>
          <a href="Sharon_Karishma_Resume.pdf" download class="btn btn-secondary" style="width: 100%; border-color: var(--accent-color); color: var(--accent-color); font-weight: 600;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download Resume (PDF Placeholder)
          </a>
        </div>
      </div>

      <!-- Illustration column -->
      <div class="contact-social-illustration">
        <!-- SVG Envelope illustration -->
        <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="15" y="30" width="90" height="60" rx="6" />
          <path d="M15 30 L60 65 L105 30" />
          <circle cx="60" cy="90" r="8" fill="var(--accent-color)" opacity="0.2" />
        </svg>
      </div>
    </div>
  `;
}

// 404 View
function render404(container) {
  container.innerHTML = `
    <div style="text-align:center; padding: 80px 24px;">
      <h2>404 — Page Not Found</h2>
      <p class="secondary" style="margin-bottom:24px;">The URL hash path does not exist in Sharon's portfolio directory.</p>
      <a href="#/" class="btn btn-primary">Return to Homepage</a>
    </div>
  `;
}

// Start application
window.addEventListener('DOMContentLoaded', init);
