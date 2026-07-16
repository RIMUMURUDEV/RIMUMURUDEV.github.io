const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const header = document.querySelector(".site-header");
const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const links = [...document.querySelectorAll(".nav a")];
const sections = links
  .filter((link) => link.getAttribute("href")?.startsWith("#"))
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.toggleAttribute("aria-current", active);
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0.15, 0.4, 0.7] },
  );

  sections.forEach((section) => observer.observe(section));

  const revealTargets = document.querySelectorAll(
    ".section-head, .featured-copy, .featured-media, .project-card, .skill-columns > div, .contact > *",
  );
  revealTargets.forEach((target) => target.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  revealTargets.forEach((target) => revealObserver.observe(target));
}
