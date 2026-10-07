Nuvora smooth-performance build

Changes applied:
- Lenis limited to large desktop only. Touch/tablet/mobile use native scrolling.
- Cinematic pinned hero and story timelines limited to >=1200px and non-touch pointers.
- Removed the per-frame gsap.to() calls from ScrollTrigger onUpdate.
- Reduced the number of continuous scrubbed animations and expensive background-position animation.
- Internal/service pages no longer download GSAP, ScrollTrigger, or Lenis unnecessarily.
- Added IntersectionObserver one-time reveals for pages that do not need cinematic motion.
- Preserved reduced-motion support.
- Kept horizontal-overflow protections and neutralized floating hero offsets.

This build is intended to be a drop-in replacement for the current Nuvora frontend files.
