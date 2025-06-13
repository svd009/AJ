document.addEventListener("DOMContentLoaded", function () {
  // Smooth scroll for navigation links
  document.querySelectorAll("nav ul li a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // Fade-in animation for sections
  const sections = document.querySelectorAll("main section, .hero");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section) => {
    section.style.opacity = 0;
    section.style.transform = "translateY(50px)";
    section.style.transition = "all 0.6s ease-out";
    observer.observe(section);
  });

  // Future: Toggle mobile nav or modal (placeholder for extension)
});
