import {
  contactDetails,
  faqItems as defaultFaqItems,
  githubUrl,
  navItems as defaultNavItems,
  personalCards as defaultPersonalCards,
  services as defaultServices,
  skillGroups as defaultSkillGroups,
  socialLinks as defaultSocialLinks,
  workExperience,
  education,
  heroStats,
} from "./siteContent";

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface PersonCard {
  label: string;
  value: string;
  href?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface SkillGroup {
  name: string;
  percent: number;
  skills: string[];
}

export interface ResumeEntry {
  name: string;
  period: string;
  title: string;
  description: string;
  bullets: string[];
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteContent {
  navItems: NavItem[];
  hero: {
    greeting: string;
    name: string;
    roles: string[];
    intro: string;
    image: string;
    imageAlt: string;
    stats: Stat[];
    proof: Stat[];
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  about: {
    heading: string;
    image: string;
    paragraphs: string[];
    personalCards: PersonCard[];
  };
  skills: SkillGroup[];
  resume: {
    intro: string;
    experienceTitle: string;
    experienceIntro: string;
    experience: ResumeEntry[];
    educationTitle: string;
    educationIntro: string;
    education: ResumeEntry[];
  };
  services: {
    intro: string;
    heading: string;
    text: string;
    ctaLabel: string;
    items: ServiceItem[];
  };
  faq: {
    intro: string;
    items: FaqItem[];
  };
  contact: {
    category: string;
    heading: string;
    intro: string;
    email: string;
    phone: string;
    github: string;
    footerName: string;
    footerRole: string;
    socials: SocialLink[];
  };
}

export const defaultSiteContent: SiteContent = {
  navItems: defaultNavItems,
  hero: {
    greeting: "Hello, I am",
    name: "antony",
    roles: [
      "a Software Developer",
      "a UI/UX Designer",
      "a Network Engineer",
      "a IT Support Engineer",
      "a Maintenance Engineer",
    ],
    intro:
      "I am a Software Developer focused on building modern, responsive and user-friendly web applications. My main development stack includes React, Next.js, JavaScript, Python and Django, with additional experience in UI/UX design, networking, computer maintenance and technical support.",
    image: "/images/Hero%20image.png",
    imageAlt: "Antony working at a computer",
    stats: heroStats,
    proof: [
      { value: "5+", label: "Years Experience" },
      { value: "100+", label: "Projects Completed" },
      { value: "60+", label: "Clients Served" },
      { value: "5", label: "Technologies" },
    ],
    primaryCta: { label: "View My Work", href: "#portfolio" },
    secondaryCta: { label: "Let's Connect", href: "#contact" },
  },
  about: {
    heading: "Software Developer & ICT Technical Specialist",
    image: "/images/profile-square-2.png",
    paragraphs: [
      "I am antoh, a Software Developer focused on full-stack web development, modern user interfaces, database-driven applications and practical ICT support.",
      "My work combines frontend and backend development with real-world troubleshooting, networking, maintenance and user support. I enjoy solving technical problems, building clean and responsive digital experiences, and delivering solutions that are both functional and easy to use.",
    ],
    personalCards: defaultPersonalCards,
  },
  skills: defaultSkillGroups,
  resume: {
    intro:
      "Software development, ICT support, networking and full-stack problem solving built around practical digital solutions.",
    experienceTitle: "Professional Experience",
    experienceIntro:
      "Software development, full-stack web work, systems support, and technical operations in ICT environments.",
    experience: workExperience.map((job) => ({
      name: job.company,
      period: job.period,
      title: job.title,
      description: job.description,
      bullets: job.bullets,
    })),
    educationTitle: "Training & Certifications",
    educationIntro:
      "Relevant professional development in web development, networking and cybersecurity.",
    education: education.map((item) => ({
      name: item.school,
      period: item.period,
      title: item.degree,
      description: item.description,
      bullets: item.bullets,
    })),
  },
  services: {
    intro:
      "Practical development, design and technical support services for modern digital products and business systems.",
    heading:
      "Digital solutions built for performance, usability and support.",
    text: "From web applications and design systems to infrastructure support and troubleshooting, I help turn technical requirements into reliable solutions.",
    ctaLabel: "See all services",
    items: defaultServices,
  },
  faq: {
    intro:
      "Clear answers about my development work, technical support background, and the kind of digital solutions I build.",
    items: defaultFaqItems,
  },
  contact: {
    category: "Contact Me",
    heading: "I'd love to hear about your next project.",
    intro:
      "I am available for web development, technical support, UI/UX work, systems support and digital projects that need thoughtful design and solid implementation.",
    email: contactDetails.email,
    phone: contactDetails.phone,
    github: contactDetails.github || githubUrl,
    footerName: "antoh",
    footerRole: "Software Developer | Computer Science",
    socials: defaultSocialLinks,
  },
};

export const CONTENT_SECTIONS = [
  "navItems",
  "hero",
  "about",
  "skills",
  "resume",
  "services",
  "faq",
  "contact",
] as const;

export type ContentSection = (typeof CONTENT_SECTIONS)[number];

export function isContentSection(value: string): value is ContentSection {
  return (CONTENT_SECTIONS as readonly string[]).includes(value);
}
