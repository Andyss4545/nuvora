(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const largeMotion = window.innerWidth >= 1200 && !coarsePointer && !reduceMotion;

  window.addEventListener('load', () => {
    const loader = $('.site-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.transition = 'opacity .45s ease';
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }, 250);
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
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'start'});
      if (mobileNav) mobileNav.style.display = 'none';
      menu?.setAttribute('aria-expanded', 'false');
    }
  });

  // Lightweight reveal for all pages. No GSAP is required for internal pages.
  const reveal = $$('.reveal-up');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveal.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.transition = 'opacity .65s ease, transform .65s cubic-bezier(.22,1,.36,1)';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      });
    }, {rootMargin:'0px 0px -10% 0px', threshold:.08});
    reveal.forEach(el => io.observe(el));
  }

  const steps = $$('.story-step');
  const scenes = $$('.story-scene');
  const activateStep = index => {
    steps.forEach((s,i) => s.classList.toggle('active', i === index));
    scenes.forEach((s,i) => s.classList.toggle('active', i === index));
  };
  steps.forEach((step, i) => step.addEventListener('click', () => activateStep(i)));

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Only large desktop gets the heavy cinematic timelines.
    if (largeMotion) {
      gsap.utils.toArray('.reveal-up').forEach(el => {
        gsap.to(el, {opacity:1, y:0, duration:.7, ease:'power3.out', scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      });

      const heroCinema = $('.hero-cinema');
      const heroScenes = $$('.hero-scene', heroCinema || document);
      const heroIndexes = $$('.hero-scene-index span', heroCinema || document);

      if (heroCinema && heroScenes.length) {
        const heroTl = gsap.timeline({
          scrollTrigger: { trigger: heroCinema, start:'top top', end:'bottom bottom', scrub:1 }
        });
        heroScenes.forEach((scene, i) => {
          const next = heroScenes[i + 1];
          heroTl.to(scene, {opacity:1, visibility:'visible', duration:.08}, i === 0 ? 0 : i * .25);
          if (i < heroScenes.length - 1) {
            heroTl
              .to(scene.querySelector('.hero-scene-copy'), {y:-35, opacity:0, duration:.12}, i*.25+.16)
              .to(scene.querySelector('.hero-scene-card'), {y:-25, opacity:0, duration:.12}, i*.25+.16)
              .to(next, {opacity:1, visibility:'visible', duration:.14}, i*.25+.22)
              .fromTo(next.querySelector('.hero-scene-copy'), {y:40, opacity:0}, {y:0, opacity:1, duration:.14}, i*.25+.22)
              .fromTo(next.querySelector('.hero-scene-card'), {y:35, opacity:0}, {y:'-50%', opacity:1, duration:.14}, i*.25+.22)
              .to(next.querySelector('.hero-scene-bg'), {scale:1, duration:.25, ease:'none'}, i*.25+.22)
              .call(() => heroIndexes.forEach((x,n) => x.classList.toggle('active', n === i+1)), [], i*.25+.25);
          }
        });
      } else if (heroScenes.length) {
        heroScenes.forEach((scene,i) => scene.classList.toggle('is-active', i===0));
      }

      const story = $('.story');
      const storyStage = $('.story-stage');
      const storyScenes = $$('.story-scene');
      if (story && storyStage && storyScenes.length) {
        const storyTl = gsap.timeline({
          scrollTrigger: {trigger:story,start:'top top',end:'+=2200',pin:storyStage,scrub:1,anticipatePin:1,invalidateOnRefresh:true}
        });
        storyScenes.forEach((scene,i) => {
          const image = scene.querySelector('.scene-photo, .scene-panel');
          const at = i*.25;
          storyTl.to(scene,{opacity:1,scale:1,duration:i===0?.18:.14,ease:'power2.out'},at);
          if (image) storyTl.fromTo(image,{scale:1.08,y:24},{scale:1,y:0,duration:.25,ease:'none'},at);
          if (i < storyScenes.length-1) {
            storyTl.to(scene,{opacity:0,scale:.96,duration:.12},at+.19)
              .to(storyScenes[i+1],{opacity:1,scale:1,duration:.14},at+.22)
              .fromTo(storyScenes[i+1].querySelector('.scene-card,.scene-panel,.scene-photo'),{scale:1.08,y:24},{scale:1,y:0,duration:.22,ease:'none'},at+.22)
              .call(()=>activateStep(i+1),[],at+.25);
          }
        });
      } else if (storyScenes.length) {
        storyScenes.forEach((scene,i)=>scene.classList.toggle('active',i===0));
      }

      // Dashboard: keep the data reveal, but use a small number of transforms.
      const dashboard = $('.dashboard');
      const dashboardIntro = $('.dashboard-intro');
      const dashboardShell = $('.dashboard-shell');
      const dashboardCards = $$('.score-card, .health-list, .chart-card');
      const ring = $('.score-ring');
      const number = $('#scoreNumber');
      const chart = $('#chartLine');
      const point = $('#chartPoint');
      if (dashboard && dashboardShell) {
        if (dashboardIntro) gsap.fromTo(dashboardIntro,{y:45,opacity:.2},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:dashboard,start:'top 88%',end:'top 45%',scrub:1}});
        gsap.fromTo(dashboardShell,{y:55,scale:.97,opacity:.45},{y:0,scale:1,opacity:1,ease:'power2.out',scrollTrigger:{trigger:dashboardShell,start:'top 90%',end:'top 55%',scrub:1}});
        dashboardCards.forEach((card,i)=>gsap.fromTo(card,{y:25+i*5,opacity:.25},{y:0,opacity:1,ease:'power2.out',scrollTrigger:{trigger:dashboardShell,start:'top 78%',end:'top 52%',scrub:1}}));
        if (ring && number) {
          ScrollTrigger.create({trigger:dashboardShell,start:'top 72%',once:true,onEnter:()=>{
            let n=0;
            const timer=setInterval(()=>{number.textContent=++n;if(n>=84)clearInterval(timer)},18);
            ring.style.transition='background 1.2s ease';
            requestAnimationFrame(()=>ring.style.background='conic-gradient(var(--teal) 302deg,#dce6e3 302deg)');
            if(chart){const length=chart.getTotalLength();chart.style.strokeDasharray=length;chart.style.strokeDashoffset=length;requestAnimationFrame(()=>{chart.style.transition='stroke-dashoffset 1.6s ease';chart.style.strokeDashoffset='0'})}
            if(point){point.style.opacity='0';setTimeout(()=>point.style.opacity='1',1100)}
          }});
        }
      }

      const why = $('.why'), whyContent=$('.why-content'), whyVisual=$('.why-visual'), whyPhoto=$('.why-photo'), stats=$$('.stats-grid > div');
      if (why) {
        if(whyContent) gsap.fromTo(whyContent,{x:-45,opacity:.25},{x:0,opacity:1,ease:'none',scrollTrigger:{trigger:why,start:'top 82%',end:'top 38%',scrub:1}});
        if(whyVisual) gsap.fromTo(whyVisual,{x:45,y:45,opacity:.2},{x:0,y:0,opacity:1,ease:'none',scrollTrigger:{trigger:why,start:'top 82%',end:'top 35%',scrub:1}});
        if(whyPhoto) gsap.fromTo(whyPhoto,{scale:1.08},{scale:1,ease:'none',scrollTrigger:{trigger:whyPhoto,start:'top 90%',end:'bottom 20%',scrub:1}});
        stats.forEach(stat=>gsap.fromTo(stat,{y:25,opacity:.2},{y:0,opacity:1,ease:'power2.out',scrollTrigger:{trigger:stat,start:'top 90%',end:'top 66%',scrub:1}}));
      }

      const services=$('.services'), serviceCards=$$('.service-card');
      if(services && serviceCards.length){
        serviceCards.forEach((card,i)=>{
          const direction=i%2===0?1:-1;
          gsap.fromTo(card,{y:45,x:direction*20,rotate:direction*.4,opacity:.2,scale:.98},{y:0,x:0,rotate:0,opacity:1,scale:1,ease:'power2.out',scrollTrigger:{trigger:card,start:'top 92%',end:'top 64%',scrub:1,invalidateOnRefresh:true}});
        });
      }

      const testimonial=$('.testimonial'), testimonialPhoto=$('.testimonial-photo'), testimonialCopy=$('.testimonial-copy');
      if(testimonial){
        if(testimonialPhoto) gsap.fromTo(testimonialPhoto,{y:45,scale:1.05,opacity:.3},{y:0,scale:1,opacity:1,ease:'none',scrollTrigger:{trigger:testimonial,start:'top 88%',end:'center 45%',scrub:1}});
        if(testimonialCopy) gsap.fromTo(testimonialCopy,{x:40,opacity:.25},{x:0,opacity:1,ease:'none',scrollTrigger:{trigger:testimonial,start:'top 84%',end:'center 42%',scrub:1}});
      }

      const finalCta=$('.final-cta'), ctaInner=$('.cta-inner'), benefitStrip=$('.benefit-strip');
      if(finalCta){
        if(ctaInner) gsap.fromTo(ctaInner,{y:45,opacity:.2,scale:.985},{y:0,opacity:1,scale:1,ease:'none',scrollTrigger:{trigger:finalCta,start:'top 88%',end:'top 44%',scrub:1}});
        if(benefitStrip) gsap.fromTo(benefitStrip,{y:25,opacity:.2},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:benefitStrip,start:'top 92%',end:'top 66%',scrub:1}});
      }
    }

    // Simple internal pages: one-time reveals only. No per-frame scrub effects.
    if (document.body.classList.contains('internal-page')) {
      document.body.classList.add('cinematic-ready');
      if (largeMotion) {
        const internalHero=$('.page-hero');
        const heroCopy=internalHero?.querySelector('.page-hero-grid > div:first-child');
        const heroMedia=internalHero?.querySelector('.page-hero-media');
        if(heroCopy) gsap.fromTo(heroCopy,{y:35,opacity:0},{y:0,opacity:1,duration:.75,ease:'power3.out',delay:.05});
        if(heroMedia) gsap.fromTo(heroMedia,{y:35,opacity:0,scale:.98},{y:0,opacity:1,scale:1,duration:.85,ease:'power3.out',delay:.1});
      }
    }

    ScrollTrigger.refresh();
  }

  // Lenis is intentionally limited to large desktop. Native scrolling is smoother
  // and more reliable on touch devices and smaller screens.
  if (window.Lenis && window.ScrollTrigger && largeMotion) {
    const lenis = new Lenis({duration:0.8,smoothWheel:true,syncTouch:false,gestureOrientation:'vertical',wheelMultiplier:0.9});
    const raf = time => { lenis.raf(time * 1000); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
  }

  const form=$('.newsletter form');
  form?.addEventListener('submit',e=>{e.preventDefault();const input=$('input',form);if(input?.value.trim()){const btn=$('button',form);btn.textContent='✓';input.value='';input.placeholder='You’re on the list';}});

  if (reduceMotion) {
    $$('.reveal-up, .internal-page main > section, .internal-page .feature-card, .internal-page .service-detail, .internal-page .resource-card, .internal-page .faq-item').forEach(el=>{el.style.opacity='1';el.style.transform='none';el.style.clipPath='none'});
  }
})();
