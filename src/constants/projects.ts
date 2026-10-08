export type Project = {
  slug: string;
  number: string;
  title: string;
  description: string;
  details: string[];
  highlights: string[];
  tags: string[];
  metric: string;
  year: string;
  role: string;
  github?: string;
  demo?: string;
  demoLabel?: string;
  reference?: { label: string; href: string };
  preview: string[];
};

export const projects: Project[] = [
  {
    slug: "placement-portal",
    number: "01",
    title: "NIT Durgapur Placement Portal",
    description:
      "A production placement platform serving 3,500+ students, with role-based job, offer, and document workflows.",
    details: [
      "Designed and developed features for NIT Durgapur’s placement platform, supporting students and the placement team through role-based workflows.",
      "Built the Interview Experience module so students can submit and browse verified interview experiences, with admin moderation for reliable peer insights.",
      "Optimized frontend performance with dynamic imports, lazy loading, pagination, and memoization. Dockerized the application and built GitHub Actions pipelines to deploy the Next.js and Python services through Docker Compose across production and demo environments.",
    ],
    highlights: [
      "Platform serving 3,500+ students",
      "Moderated interview experience repository",
      "Docker Compose deployments with GitHub Actions CI/CD",
    ],
    tags: ["Next.js", "React", "Docker", "Nginx", "GitHub Actions"],
    metric: "3,500+ students",
    year: "",
    role: "Contributor · full-stack development",
    demo: "https://placement.nitdgp.ac.in/",
    demoLabel: "Live portal",
    reference: { label: "Contributors", href: "https://placement.nitdgp.ac.in/contributors/" },
    preview: [
      "students → jobs & offers",
      "interview experiences → moderation",
      "Next.js + Python → Docker Compose",
      "GitHub Actions → production / demo",
    ],
  },
  {
    slug: "ask-assist",
    number: "02",
    title: "Ask-Assist",
    description:
      "An AI-powered campus assistant combining hybrid intent classification, structured lookups, and retrieval over institutional PDFs.",
    details: [
      "Built a campus assistant with FastAPI and Streamlit, using a three-level hybrid intent classification pipeline to route queries.",
      "Implemented a RAG pipeline with ChromaDB and Sentence Transformers using 384-dimensional vectors, grounding responses in institutional PDF documents.",
      "Designed a SQLite schema and fuzzy entity matching for contact and location lookups. Integrated Mistral-7B for response formatting with confidence-based fallback handling.",
    ],
    highlights: [
      "Three-level hybrid query routing",
      "Context-grounded PDF retrieval",
      "Structured lookups with confidence-based fallbacks",
    ],
    tags: ["FastAPI", "SQLAlchemy", "ChromaDB", "Streamlit", "RAG", "Transformers"],
    metric: "Campus AI",
    year: "",
    role: "Developer",
    github: "https://github.com/irshadsiddi/Ask-Assist",
    preview: [
      "query → intent classification",
      "PDFs → ChromaDB retrieval",
      "contacts / locations → SQLite",
      "Mistral-7B → formatted response",
    ],
  },
  {
    slug: "glug-app",
    number: "03",
    title: "GLUG App",
    description:
      "A cross-platform Flutter app helping 500+ students track attendance and receive real-time club event updates.",
    details: [
      "Developed a cross-platform Flutter app with a Firebase backend for student attendance tracking and real-time updates on club events.",
      "Created a smart attendance tracker with subject-wise statistics and semester progress monitoring, using Firebase Auth, Firestore, and Riverpod.",
    ],
    highlights: [
      "Supporting 500+ students",
      "Subject-wise attendance statistics",
      "Semester progress and real-time club updates",
    ],
    tags: ["Flutter", "Firebase Auth", "Firestore", "Riverpod"],
    metric: "500+ students",
    year: "",
    role: "App developer",
    demo: "https://play.google.com/store/apps/details?id=com.nitdlug.app",
    demoLabel: "Google Play",
    preview: [
      "Flutter → cross-platform app",
      "Firebase Auth → sign-in",
      "Firestore → real-time updates",
      "attendance → subject & semester stats",
    ],
  },
];
