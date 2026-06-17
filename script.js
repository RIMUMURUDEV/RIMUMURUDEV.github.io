const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const links = [...document.querySelectorAll(".nav a")];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

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
  { rootMargin: "-35% 0px -55% 0px", threshold: [0.15, 0.4, 0.7] },
);

sections.forEach((section) => observer.observe(section));
