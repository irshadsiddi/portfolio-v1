export const experiences = [
  {
    date: "Apr — Jun 2026",
    role: "Full Stack Developer Intern",
    company: "UTORO Industries Private Limited",
    summary:
      "Engineered a full-stack fashion e-commerce platform spanning authentication, product discovery, cart, checkout, payments, and order/return workflows with Next.js and Node.js.",
    detail:
      "Architected a role-based admin dashboard for users, inventory, and orders. Enhanced storefront interactions with Framer Motion. Added Redis caching to product and search pages, cutting API response times by 60%, plus Redis-based rate limiting on authentication and search endpoints.",
    stack: ["Next.js", "Node.js", "Redis", "Framer Motion"],
  },
] as const;

export const education = {
  institution: "National Institute of Technology, Durgapur",
  degree: "Bachelor of Technology in Computer Science and Engineering",
  dates: "August 2023 — Present",
  location: "Durgapur, West Bengal",
} as const;

export const profile = {
  heading: "Full-stack development, grounded AI, and real-world impact.",
  description:
    "I’m a Computer Science and Engineering undergraduate at NIT Durgapur. My work spans production web platforms, campus AI assistants, mobile applications, and open-source integrations.",
} as const;
