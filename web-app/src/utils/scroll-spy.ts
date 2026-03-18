// ── Scroll Spy for Section Navigation ────────────────

let scrollSpyCleanup: (() => void) | null = null;

export function setupScrollSpy(): void {
  // Clean up any existing scroll spy
  if (scrollSpyCleanup) {
    scrollSpyCleanup();
    scrollSpyCleanup = null;
  }

  const sections = document.querySelectorAll<HTMLElement>('.content-section');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.section-nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in upper portion
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));

  // Store cleanup function
  scrollSpyCleanup = () => {
    observer.disconnect();
  };
}
