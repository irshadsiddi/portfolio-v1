export const labItems = [
  {
    kind: "Profile",
    title: "Codeforces",
    note: "Competitive programming and problem solving.",
    date: "",
    href: "https://codeforces.com/profile/irshadsiddi",
  },
  {
    kind: "Profile",
    title: "CodeChef",
    note: "2 star · maximum rating 1412, as listed on my résumé.",
    date: "",
    href: "https://www.codechef.com/users/irshadsiddi",
  },
  {
    kind: "Community",
    title: "NIT Durgapur Placement Portal",
    note: "Listed among the current contributors · CSE, Class of 2027.",
    date: "",
    href: "https://placement.nitdgp.ac.in/contributors/",
  },
] as const;
export const recognitionItems = [
  {
    label: "AgentHack 2025",
    value: "Recognized as a Top Performer at AgentHack 2025, organized by WeMakeDevs.",
  },
  { label: "JEE Mains 2023", value: "All India Rank 7,672 among 1.3M+ candidates · top 0.6%." },
  { label: "TS EAMCET 2023", value: "Rank 1,352 among 3.2L+ candidates · top 0.4%." },
  {
    label: "Problem solving",
    value: "300+ DSA problems solved across Codeforces and CodeChef, as listed on my résumé.",
  },
] as const;

export const openSourceContribution = {
  title: "Coral · Lemon Squeezy connector",
  description:
    "Built a community data source connector using a 12-table YAML DSL manifest covering stores, products, orders, subscriptions, discounts, and license keys. Handled minor-unit currency conversion, partial and full refunds, and usage-based subscription items.",
  reference: "PR #1057 · YAML DSL, REST APIs, SQL",
} as const;
