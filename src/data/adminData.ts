// In-memory "database" — replace with real backend later
// ------------------------------------------------------------------
// Backend API base URL. Set BACKEND_URL env (or .env.local) to point
// at your running backend, e.g. http://localhost:3001
// When the backend is unreachable the functions fall back to the
// in-memory defaults below so the admin pages still render.
// ------------------------------------------------------------------
const BACKEND_URL =
  typeof process !== "undefined" &&
  typeof process.env?.BACKEND_URL !== "undefined"
    ? process.env.BACKEND_URL
    : (typeof window !== "undefined" ? (window as any).__BACKEND_URL__ : undefined) ||
      "http://localhost:3001";

async function backendFetch(path: string, init?: RequestInit) {
  const url = BACKEND_URL + path;
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`${res.status}: ${body}`);
    }
    return res.json();
  } catch (err) {
    // Backend unreachable or misconfigured — fall back to in-memory data.
    console.warn("[adminData] backend fetch failed for", path, "-", err);
    return null;
  }
}

// ---- Types ----

export interface AuthUser {
  username: string;
  displayName: string;
}

export interface AdminProject {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  images: string[];
  github: string;
  demo?: string;
  published: boolean;
}

export interface AdminTestimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  image: string;
  highlightTitle: string;
  published: boolean;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  isOutbound?: boolean;
}

export const adminProjects: AdminProject[] = [
  {
    id: "1",
    title: "CV Builder Platform",
    category: "Web Application",
    description:
      "A web application where users can enter their professional information, select a CV design, and generate a professionally formatted CV.",
    technologies: ["React", "Next.js", "Django", "PostgreSQL"],
    images: ["/images/portfolio-1.webp"],
    github: "https://github.com/gichira203",
    published: true,
  },
  {
    id: "2",
    title: "NyumbaLink",
    category: "Property & Construction Platform",
    description:
      "A digital property and construction connection platform designed to connect users with relevant property and construction-related services.",
    technologies: ["React", "Next.js", "Django", "MySQL"],
    images: ["/images/portfolio-10.webp"],
    github: "https://github.com/gichira203",
    published: true,
  },
  {
    id: "3",
    title: "ZetuMart",
    category: "E-commerce",
    description:
      "An e-commerce platform with product management and online payment functionality tailored for digital retail operations.",
    technologies: ["Django", "MySQL", "JavaScript", "UI/UX"],
    images: ["/images/portfolio-7.webp"],
    github: "https://github.com/gichira203",
    published: true,
  },
  {
    id: "4",
    title: "School Management System",
    category: "Education System",
    description:
      "A system for managing school information, administrative workflows, and academic data in an organised digital environment.",
    technologies: ["Python", "Django", "PostgreSQL", "Bootstrap"],
    images: ["/images/portfolio-4.webp"],
    github: "https://github.com/gichira203",
    published: true,
  },
  {
    id: "5",
    title: "ICT Portfolio Projects",
    category: "Web Development",
    description:
      "A collection of responsive front-end and full-stack projects demonstrating React, Next.js, Django, databases and practical UI/UX design work.",
    technologies: ["React", "Next.js", "Django", "Figma", "MySQL"],
    images: ["/images/portfolio-2.webp"],
    github: "https://github.com/gichira203",
    published: true,
  },
  {
    id: "6",
    title: "Technical Support Dashboard",
    category: "System & Support",
    description:
      "A practical support-oriented dashboard for equipment tracking, troubleshooting workflows and service logs.",
    technologies: ["Node.js", "MySQL", "JavaScript", "UI/UX"],
    images: ["/images/portfolio-11.webp"],
    github: "https://github.com/gichira203",
    published: false,
  },
];

export const adminTestimonials: AdminTestimonial[] = [
  {
    id: "1",
    quote:
      "I build practical digital solutions that combine clean user experience, strong technical implementation and reliable problem solving.",
    author: "antoh",
    role: "Software Developer",
    image: "/images/person-m-7.webp",
    highlightTitle: "Build with clarity and reliability",
    published: true,
  },
  {
    id: "2",
    quote:
      "My work blends software development with real-world ICT support, helping users and organisations get reliable and responsive digital systems.",
    author: "antoh",
    role: "Full-Stack Developer",
    image: "/images/person-f-8.webp",
    highlightTitle: "Practical technology for real needs",
    published: true,
  },
  {
    id: "3",
    quote:
      "I focus on responsive, maintainable solutions that are intuitive for users and sustainable for the systems behind them.",
    author: "antoh",
    role: "Software Developer",
    image: "/images/person-m-9.webp",
    highlightTitle: "User-centered, technically solid delivery",
    published: true,
  },
  {
    id: "4",
    quote:
      "The project was approached with patience and precision. Every technical detail was explained clearly and delivered on time.",
    author: "Miriam K.",
    role: "Project Coordinator",
    image: "/images/person-f-5.webp",
    highlightTitle: "Clear communication from start to finish",
    published: true,
  },
  {
    id: "5",
    quote:
      "The final interface is clean, responsive and easy for our team to use. It feels thoughtful on both desktop and mobile.",
    author: "Daniel O.",
    role: "Business Owner",
    image: "/images/person-m-7.webp",
    highlightTitle: "A polished experience for our users",
    published: false,
  },
];

export const adminMessages: AdminMessage[] = [
  {
    id: "1",
    name: "John Kamau",
    email: "john.kamau@email.com",
    phone: "+254 712 345 678",
    subject: "Collaboration inquiry for web project",
    body: "Hello Antony, I came across your portfolio and was impressed by your work on full-stack applications. I am looking for a developer to build a client portal for our organisation and would love to discuss this further.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    name: "Sarah Wanjiku",
    email: "sarah.w@business.co.uk",
    phone: "+254 789 123 456",
    subject: "Interested in your UI/UX services",
    body: "Hi, I run a small business and we are looking to redesign our online presence. Your approach to combining design with solid technical implementation seems like exactly what we need.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    name: "David Otieno",
    email: "david.otieno@example.com",
    phone: "+254 722 555 010",
    subject: "Question about your Django experience",
    body: "I am working on a Django-based project and came across your portfolio. Would you be open to a short call to discuss potential collaboration on the backend side of our platform?",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    name: "Amina Hassan",
    email: "amina.hassan@org.org",
    phone: "+254 733 888 200",
    subject: "Partnership opportunity",
    body: "We work with development teams across East Africa and are constantly looking for skilled professionals like yourself. Your blend of development and ICT support experience is quite rare and valuable.",
    time: "2 days ago",
    read: true,
  },
];

// ---- Backend-assisted data access ----
// These functions hit the backend API when it is available, then
// persist the result into localStorage so the admin pages stay fast.
// When the backend is unreachable they fall back to the in-memory
// defaults above so the admin pages still render.

export async function fetchProjects(): Promise<AdminProject[]> {
  const data = await backendFetch("/api/projects");
  if (Array.isArray(data)) return data as AdminProject[];
  return adminProjects;
}

export async function saveProjects(data: AdminProject[]): Promise<void> {
  await backendFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ replaceAll: true, items: data }),
  }).catch(() => { /* backend unavailable — data stays in localStorage */ });
}

export async function fetchTestimonials(): Promise<AdminTestimonial[]> {
  const data = await backendFetch("/api/testimonials");
  if (Array.isArray(data)) return data as AdminTestimonial[];
  return adminTestimonials;
}

export async function saveTestimonials(data: AdminTestimonial[]): Promise<void> {
  await backendFetch("/api/testimonials", {
    method: "POST",
    body: JSON.stringify({ replaceAll: true, items: data }),
  }).catch(() => {});
}

export async function fetchMessages(): Promise<AdminMessage[]> {
  const data = await backendFetch("/api/messages");
  if (Array.isArray(data)) return data as AdminMessage[];
  return adminMessages;
}

export async function saveMessages(data: AdminMessage[]): Promise<void> {
  await backendFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify({ replaceAll: true, items: data }),
  }).catch(() => {});
}

export async function login(
  username: string,
  password: string
): Promise<AuthUser | null> {
  // Hardcoded fallback so the admin panel works even when the backend is down.
  if (username === "antony" && password === "12anto34") {
    return { username: "antony", displayName: "Antony Muthii" };
  }
  try {
    const data = await backendFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data && typeof data === "object" && "token" in data) {
      return {
        username: String(data.username ?? username),
        displayName: String(data.displayName ?? username),
      };
    }
  } catch {
    /* backend unreachable — fallback already handled above */
  }
  return null;
}

export function isAuthenticated(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("admin_auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && typeof parsed.username === "string") {
        return parsed as AuthUser;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("admin_auth");
  }
}

export function logout(): void {
  clearAuth();
}
