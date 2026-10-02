(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  window.addEventListener('load', () => {
    const loader = $('.site-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.transition = 'opacity .55s ease';
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 600);
      }, 350);
    }
  });

  const header = $('#siteHeader');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = $('.menu-toggle');
  let mobileNav;
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    if (!mobileNav) {
      mobileNav = document.createElement('div');
      mobileNav.className = 'mobile-nav';
      const internalBase = location.pathname.includes('/services/') ? '../' : './';
      mobileNav.innerHTML = `<a href="${internalBase}about.html">Why Nuvora</a><a href="${internalBase}how-it-works.html">How It Works</a><a href="${internalBase}services.html">Services</a><a href="${internalBase}results.html">Results</a><a href="${internalBase}resources.html">Resources</a>`;
      Object.assign(mobileNav.style, {position:'fixed',top:'74px',left:'0',right:'0',background:'#f4f6f5',padding:'22px 20px',display:'grid',gap:'4px',zIndex:'99',borderBottom:'1px solid #dbe2df'});
      [...mobileNav.querySelectorAll('a')].forEach(a => Object.assign(a.style,{padding:'14px 0',fontWeight:'700',fontSize:'14px'}));
      document.body.appendChild(mobileNav);
    }
    mobileNav.style.display = open ? 'none' : 'grid';
  });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      document.querySelector(id).scrollIntoView({behavior:'smooth', block:'start'});
      if (mobileNav) mobileNav.style.display = 'none';
      menu?.setAttribute('aria-expanded', 'false');
    }
  });

  const steps = $$('.story-step');
  const scenes = $$('.story-scene');
  const activateStep = index => {
    steps.forEach((s,i) => s.classList.toggle('active', i === index));
    scenes.forEach((s,i) => s.classList.toggle('active', i === index));
  };
  steps.forEach((step, i) => step.addEventListener('click', () => activateStep(i)));

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal-up').forEach(el => {
      gsap.to(el, {opacity:1, y:0, duration:.8, ease:'power3.out', scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    /* Cinematic hero: same pinned, scrubbed scene choreography as the experimental homepage. */
    const heroCinema = $('.hero-cinema');
    const heroScenes = $$('.hero-scene', heroCinema || document);
    const heroIndexes = $$('.hero-scene-index span', heroCinema || document);

    if (heroCinema && heroScenes.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroCinema,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      });

      heroScenes.forEach((scene, i) => {
        const next = heroScenes[i + 1];
        heroTl.to(scene, {opacity:1, visibility:'visible', duration:.08}, i === 0 ? 0 : i * .25);

        if (i < heroScenes.length - 1) {
          heroTl
            .to(scene.querySelector('.hero-scene-copy'), {y:-35, opacity:0, duration:.12}, i * .25 + .16)
            .to(scene.querySelector('.hero-scene-card'), {y:-25, opacity:0, duration:.12}, i * .25 + .16)
            .to(next, {opacity:1, visibility:'visible', duration:.14}, i * .25 + .22)
            .fromTo(next.querySelector('.hero-scene-copy'), {y:40, opacity:0}, {y:0, opacity:1, duration:.14}, i * .25 + .22)
            .fromTo(next.querySelector('.hero-scene-card'), {y:35, opacity:0}, {y:'-50%', opacity:1, duration:.14}, i * .25 + .22)
            .to(next.querySelector('.hero-scene-bg'), {scale:1, duration:.25, ease:'none'}, i * .25 + .22)
            .call(() => {
              heroIndexes.forEach((x,n) => x.classList.toggle('active', n === i + 1));
            }, [], i * .25 + .25);
        }
      });

      // Keep the cinematic hero in sync when the viewport is resized
      // (for example, when a desktop browser is dragged to mobile width).
      let heroResizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(heroResizeTimer);
        heroResizeTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
      }, { passive: true });
    } else if (heroScenes.length) {
      heroScenes.forEach((scene, i) => scene.classList.toggle('is-active', i === 0));
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =====================================================
       HOW IT WORKS: cinematic pinned storytelling
       Desktop/tablet gets the immersive sequence. Mobile keeps
       natural scrolling and uses lightweight scene reveals.
    ===================================================== */
    const story = $('.story');
    const storyStage = $('.story-stage');
    const storyCopy = $('.story-copy');
    const storyVisual = $('.story-visual');
    const storyScenes = $$('.story-scene');

    if (story && storyStage && !reduceMotion && window.innerWidth > 750) {
      const storyTl = gsap.timeline({
        scrollTrigger: {
          trigger: story,
          start: 'top top',
          end: '+=2200',
          pin: storyStage,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      storyScenes.forEach((scene, i) => {
        const image = scene.querySelector('.scene-photo, .scene-panel');
        const isFirst = i === 0;
        const at = i * 0.25;

        storyTl
          .to(scene, {
            opacity: 1,
            scale: 1,
            duration: isFirst ? .18 : .14,
            ease: 'power2.out'
          }, at)
          .fromTo(image,
            { scale: 1.08, y: 24 },
            { scale: 1, y: 0, duration: .25, ease: 'none' },
            at
          );

        if (i < storyScenes.length - 1) {
          storyTl
            .to(scene, { opacity: 0, scale: .96, duration: .12 }, at + .19)
            .to(storyScenes[i + 1], { opacity: 1, scale: 1, duration: .14 }, at + .22)
            .fromTo(storyScenes[i + 1].querySelector('.scene-card, .scene-panel, .scene-photo'),
              { scale: 1.08, y: 24 },
              { scale: 1, y: 0, duration: .22, ease: 'none' },
              at + .22
            );
        }
      });

      ScrollTrigger.create({
        trigger: story,
        start: 'top top',
        end: '+=2200',
        scrub: 1,
        onUpdate: self => {
          const index = Math.min(3, Math.floor(self.progress * 4));
          activateStep(index);
          if (storyCopy) gsap.to(storyCopy, { y: self.progress * -28, duration: .2, overwrite: true });
          if (storyVisual) gsap.to(storyVisual, { y: self.progress * 18, duration: .2, overwrite: true });
        }
      });
    } else if (storyScenes.length) {
      storyScenes.forEach((scene, i) => {
        scene.classList.toggle('active', i === 0);
        gsap.set(scene, { clearProps: 'transform' });
      });
    }

    /* =====================================================
       DASHBOARD: data-driven cinematic reveal
    ===================================================== */
    const dashboard = $('.dashboard');
    const dashboardIntro = $('.dashboard-intro');
    const dashboardShell = $('.dashboard-shell');
    const dashboardCards = $$('.score-card, .health-list, .chart-card');
    const ring = $('.score-ring');
    const number = $('#scoreNumber');
    const chart = $('#chartLine');
    const point = $('#chartPoint');

    if (dashboard && dashboardShell && !reduceMotion) {
      gsap.fromTo(dashboardIntro,
        { y: 70, opacity: .15 },
        { y: 0, opacity: 1, ease: 'none', scrollTrigger: {
          trigger: dashboard,
          start: 'top 90%',
          end: 'top 42%',
          scrub: 1
        }}
      );

      gsap.fromTo(dashboardShell,
        { y: 90, scale: .94, opacity: .35 },
        { y: 0, scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: {
          trigger: dashboardShell,
          start: 'top 92%',
          end: 'top 55%',
          scrub: 1
        }}
      );

      dashboardCards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 45 + i * 10, opacity: .2 },
          { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: {
            trigger: dashboardShell,
            start: 'top 76%',
            end: 'top 42%',
            scrub: 1
          }}
        );
      });

      if (ring && number) {
        ScrollTrigger.create({
          trigger: dashboardShell,
          start: 'top 72%',
          once: true,
          onEnter: () => {
            let n = 0;
            const timer = setInterval(() => {
              n++;
              number.textContent = n;
              if (n >= 84) clearInterval(timer);
            }, 18);
            ring.style.transition = 'background 1.4s ease';
            requestAnimationFrame(() => {
              ring.style.background = 'conic-gradient(var(--teal) 302deg,#dce6e3 302deg)';
            });
            if (chart) {
              const length = chart.getTotalLength();
              chart.style.strokeDasharray = length;
              chart.style.strokeDashoffset = length;
              chart.getBoundingClientRect();
              chart.style.transition = 'stroke-dashoffset 1.8s ease';
              chart.style.strokeDashoffset = '0';
            }
            if (point) {
              point.style.opacity = '0';
              setTimeout(() => point.style.opacity = '1', 1200);
            }
          }
        });
      }
    }

    /* =====================================================
       WHY NUVORA: editorial image + stat choreography
    ===================================================== */
    const why = $('.why');
    const whyContent = $('.why-content');
    const whyVisual = $('.why-visual');
    const whyPhoto = $('.why-photo');
    const stats = $$('.stats-grid > div');

    if (why && !reduceMotion) {
      if (whyContent) gsap.fromTo(whyContent,
        { x: -70, opacity: .2 },
        { x: 0, opacity: 1, ease: 'none', scrollTrigger: {
          trigger: why, start: 'top 85%', end: 'top 35%', scrub: 1
        }}
      );
      if (whyVisual) gsap.fromTo(whyVisual,
        { x: 70, y: 80, opacity: .15 },
        { x: 0, y: 0, opacity: 1, ease: 'none', scrollTrigger: {
          trigger: why, start: 'top 85%', end: 'top 30%', scrub: 1
        }}
      );
      if (whyPhoto) gsap.fromTo(whyPhoto,
        { scale: 1.12 },
        { scale: 1, ease: 'none', scrollTrigger: {
          trigger: whyPhoto, start: 'top 90%', end: 'bottom 20%', scrub: 1
        }}
      );
      stats.forEach((stat, i) => gsap.fromTo(stat,
        { y: 45, opacity: .15 },
        { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: {
          trigger: stat, start: 'top 92%', end: 'top 65%', scrub: 1
        }}
      ));
    }

    /* =====================================================
       SERVICES: cinematic editorial card progression
    ===================================================== */
    const services = $('.services');
    const serviceCards = $$('.service-card');
    if (services && serviceCards.length && !reduceMotion) {
      serviceCards.forEach((card, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(card,
          { y: 70, x: direction * 35, rotate: direction * .7, opacity: .12, scale: .96 },
          { y: 0, x: 0, rotate: 0, opacity: 1, scale: 1, ease: 'power2.out', scrollTrigger: {
            trigger: card,
            start: 'top 94%',
            end: 'top 62%',
            scrub: 1,
            invalidateOnRefresh: true
          }}
        );
        gsap.to(card, {
          backgroundPosition: `center ${i % 2 === 0 ? '46%' : '54%'}`,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      });
    }

    /* =====================================================
       TESTIMONIAL: slow cinematic image/text separation
    ===================================================== */
    const testimonial = $('.testimonial');
    const testimonialPhoto = $('.testimonial-photo');
    const testimonialCopy = $('.testimonial-copy');
    if (testimonial && !reduceMotion) {
      if (testimonialPhoto) gsap.fromTo(testimonialPhoto,
        { y: 80, scale: 1.08, opacity: .2 },
        { y: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: {
          trigger: testimonial, start: 'top 90%', end: 'center 45%', scrub: 1
        }}
      );
      if (testimonialCopy) gsap.fromTo(testimonialCopy,
        { x: 80, opacity: .15 },
        { x: 0, opacity: 1, ease: 'none', scrollTrigger: {
          trigger: testimonial, start: 'top 85%', end: 'center 42%', scrub: 1
        }}
      );
    }

    /* =====================================================
       FINAL CTA: gentle cinematic closing movement
    ===================================================== */
    const finalCta = $('.final-cta');
    const ctaInner = $('.cta-inner');
    const benefitStrip = $('.benefit-strip');
    if (finalCta && !reduceMotion) {
      if (ctaInner) gsap.fromTo(ctaInner,
        { y: 70, opacity: .15, scale: .97 },
        { y: 0, opacity: 1, scale: 1, ease: 'none', scrollTrigger: {
          trigger: finalCta, start: 'top 90%', end: 'top 42%', scrub: 1
        }}
      );
      if (benefitStrip) gsap.fromTo(benefitStrip,
        { y: 45, opacity: .1 },
        { y: 0, opacity: 1, ease: 'none', scrollTrigger: {
          trigger: benefitStrip, start: 'top 94%', end: 'top 65%', scrub: 1
        }}
      );
    }

    /* =====================================================
       INTERNAL PAGES: shared cinematic editorial system
       Keeps desktop immersive while mobile stays touch-first.
    ===================================================== */
    if (document.body.classList.contains('internal-page')) {
      document.body.classList.add('cinematic-ready');

      const internalHero = $('.page-hero');
      const heroCopy = internalHero ? internalHero.querySelector('.page-hero-grid > div:first-child') : null;
      const heroMedia = internalHero ? internalHero.querySelector('.page-hero-media') : null;

      if (!reduceMotion) {
        if (heroCopy) {
          gsap.fromTo(heroCopy,
            { y: 55, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.05, ease: 'power3.out', delay: .08 }
          );
        }
        if (heroMedia) {
          gsap.fromTo(heroMedia,
            { y: 55, opacity: 0, scale: .965 },
            { y: 0, opacity: 1, scale: 1, duration: 1.15, ease: 'power3.out', delay: .16 }
          );
          const heroImg = heroMedia.querySelector('img');
          if (heroImg) {
            gsap.fromTo(heroImg,
              { scale: 1.12 },
              { scale: 1.02, duration: 1.8, ease: 'power2.out', delay: .05 }
            );
          }
        }

        /* Every major content section gets a restrained editorial entrance. */
        const sections = $$('.internal-page main > section:not(.page-hero)');
        sections.forEach((section, index) => {
          const children = section.querySelectorAll('.section-intro, .split-copy, .split-media, .feature-card, .service-detail, .resource-card, .faq-item, .contact-card, .contact-form, .stat, .cta-band > *');
          if (!children.length) return;

          gsap.fromTo(children,
            { y: 46, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: .8,
              stagger: .055,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: index === 0 ? 'top 82%' : 'top 88%',
                end: 'top 52%',
                scrub: 0.7,
                invalidateOnRefresh: true
              }
            }
          );
        });

        /* Long-form images drift gently against the page rather than jumping. */
        $$('.internal-page .split-media, .internal-page .page-hero-media, .internal-page .resource-media').forEach((media) => {
          gsap.to(media, {
            y: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: media,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.15
            }
          });
        });

        /* Service rows and cards have a stronger product/editorial rhythm. */
        $$('.internal-page .service-detail, .internal-page .resource-card').forEach((card, i) => {
          gsap.fromTo(card,
            { x: i % 2 ? 28 : -28, y: 35, opacity: .1, scale: .985 },
            {
              x: 0, y: 0, opacity: 1, scale: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                end: 'top 64%',
                scrub: 1,
                invalidateOnRefresh: true
              }
            }
          );
        });

        /* Feature cards rise in a measured sequence. */
        $$('.internal-page .feature-grid').forEach((grid) => {
          const cards = [...grid.children];
          gsap.fromTo(cards,
            { y: 55, opacity: .08 },
            {
              y: 0, opacity: 1,
              stagger: .09,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: grid,
                start: 'top 88%',
                end: 'top 55%',
                scrub: .8
              }
            }
          );
        });

        /* Dark sections get a slower transition to make the page feel cinematic. */
        $$('.internal-page .dark-band').forEach((band) => {
          gsap.fromTo(band,
            { clipPath: 'inset(7% 0 7% 0)' },
            { clipPath: 'inset(0% 0 0% 0)', ease: 'none', scrollTrigger: {
              trigger: band,
              start: 'top 92%',
              end: 'top 58%',
              scrub: 1
            }}
          );
        });

        /* Contact and login surfaces get a subtle depth lift. */
        $$('.internal-page .contact-card, .internal-page .login-card').forEach((panel) => {
          gsap.fromTo(panel,
            { y: 35, scale: .975, opacity: .15 },
            { y: 0, scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: {
              trigger: panel,
              start: 'top 88%',
              end: 'top 58%',
              scrub: 1
            }}
          );
        });

        /* Service detail pages get a stronger hero image depth effect. */
        if (document.querySelector('[class*="service-"]')) {
          const serviceHero = $('.page-hero-media');
          if (serviceHero) {
            gsap.to(serviceHero, {
              backgroundPosition: 'center 56%',
              ease: 'none',
              scrollTrigger: {
                trigger: '.page-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2
              }
            });
          }
        }
      }

      /* Accessibility / reduced motion: everything remains immediately visible. */
      if (reduceMotion) {
        $$('.internal-page .page-hero, .internal-page main > section, .internal-page .feature-card, .internal-page .service-detail, .internal-page .resource-card, .internal-page .faq-item').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.clipPath = 'none';
        });
      }
    }

    ScrollTrigger.refresh();
  } else {
    $$('.reveal-up').forEach(el => {el.style.opacity=1;el.style.transform='none'});
  }

  if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: true });
    const raf = time => { lenis.raf(time * 1000); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
  }

  const form = $('.newsletter form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', form);
    if (input.value.trim()) {
      const btn = $('button', form);
      btn.textContent = '✓';
      input.value = '';
      input.placeholder = 'You’re on the list';
    }
  });
})();
