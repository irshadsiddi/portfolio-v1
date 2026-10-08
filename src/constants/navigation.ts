export const navItems = [
  ["About", "about"],
  ["Experience", "experience"],
  ["Projects", "projects"],
  ["Open Source", "opensource"],
  ["Community", "writing"],
  ["Recognition", "recognition"],
] as const;

export const primaryNavItems = navItems.filter(([, id]) =>
  (["about", "projects", "experience"] as readonly string[]).includes(id),
);
