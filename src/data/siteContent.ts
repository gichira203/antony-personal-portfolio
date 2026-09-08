export const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Resume", href: "#resume" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#portfolio" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export const heroStats = [
  { value: "React", label: "Frontend" },
  { value: "Next.js", label: "Web Apps" },
  { value: "Django", label: "Backend" },
];

export const personalInfo = [
  { label: "Name", value: "antoh" },
  { label: "Course/Field", value: "Computer Science" },
  { label: "Profession", value: "Software Developer" },
  { label: "Phone", value: "0726815333" },
  { label: "Email", value: "antonygichira203@gmail.com" },
];

export const githubUrl = "https://github.com/gichira203";

export const skillGroups = [
  {
    name: "Frontend Development",
    percent: 95,
    skills: ["HTML", "CSS", "JavaScript", "React", "Next.js"],
  },
  {
    name: "Backend Development",
    percent: 92,
    skills: ["Python", "Django", "Django REST Framework", "Node.js", "PHP"],
  },
  {
    name: "Databases",
    percent: 88,
    skills: ["MySQL", "PostgreSQL", "phpMyAdmin", "MySQL Workbench"],
  },
  {
    name: "UI/UX & Design",
    percent: 90,
    skills: ["Figma", "Wireframing", "Prototyping", "Responsive UI Design"],
  },
  {
    name: "Networking & ICT",
    percent: 93,
    skills: [
      "Computer Networking",
      "Network Troubleshooting",
      "Fibre Optic Networking",
      "LAN Infrastructure",
      "Computer Maintenance",
      "Hardware Troubleshooting",
      "Software Installation",
    ],
  },
  {
    name: "Tools",
    percent: 87,
    skills: ["Git/GitHub", "VS Code", "Microsoft Office", "Google Workspace"],
  },
];

export const workExperience = [
  {
    company: "ICT Authority — Eastern Region Regional Office, Embu",
    period: "Technical support and network infrastructure role",
    title: "ICT Technical Support & Network Infrastructure",
    description:
      "I support the installation, maintenance, troubleshooting and verification of ICT systems, networks, infrastructure and digital services in the field.",
    bullets: [
      "Hardware and computer maintenance, including troubleshooting and repair of ICT equipment.",
      "Network installation, configuration, troubleshooting and service support across local infrastructure.",
      "Software installation, operating-system installation and configuration for user devices and systems.",
      "User technical support for day-to-day ICT issues and operational needs.",
      "Network infrastructure activities, including fibre-optic networking exposure and site verification.",
      "Field technical inspections and support for communication and digital infrastructure projects.",
      "Digital Literacy Programme support, data collection and entry, and GIS/network mapping using Google Earth Pro.",
      "Technical verification of ICT equipment to ensure functionality and reliability.",
    ],
  },
];

export const education = [
  {
    school: "Professional and Technical Training",
    period: "Relevant training and practical ICT experience",
    degree: "Web Development / Full-Stack Development",
    description:
      "Hands-on learning in modern web application development, UI/UX principles, and digital solution building.",
  },
  {
    school: "Technical Skills Development",
    period: "Cisco networking and cybersecurity training",
    degree: "Cisco Networking & Cisco Cybersecurity",
    description:
      "Focused learning in networking fundamentals, infrastructure support, and cybersecurity awareness.",
  },
  {
    school: "Emobilis Training",
    period: "Web development training",
    degree: "Emobilis Web Development Training",
    description:
      "Practical training covering frontend, backend, and full-stack web development concepts.",
  },
];

export const projects = [
  {
    title: "CV Builder Platform",
    category: "Web Application",
    description:
      "A web application where users can enter their professional information, select a CV design, and generate a professionally formatted CV.",
    technologies: ["React", "Next.js", "Django", "PostgreSQL"],
    image: "/images/portfolio-1.webp",
    filter: "filter-web",
    github: githubUrl,
    demo: "#",
  },
  {
    title: "NyumbaLink",
    category: "Property & Construction Platform",
    description:
      "A digital property and construction connection platform designed to connect users with relevant property and construction-related services.",
    technologies: ["React", "Next.js", "Django", "MySQL"],
    image: "/images/portfolio-10.webp",
    filter: "filter-web",
    github: githubUrl,
    demo: "#",
  },
  {
    title: "ZetuMart",
    category: "E-commerce",
    description:
      "An e-commerce platform with product management and online payment functionality tailored for digital retail operations.",
    technologies: ["Django", "MySQL", "JavaScript", "UI/UX"],
    image: "/images/portfolio-7.webp",
    filter: "filter-brand",
    github: githubUrl,
    demo: "#",
  },
  {
    title: "School Management System",
    category: "Education System",
    description:
      "A system for managing school information, administrative workflows, and academic data in an organised digital environment.",
    technologies: ["Python", "Django", "PostgreSQL", "Bootstrap"],
    image: "/images/portfolio-4.webp",
    filter: "filter-graphics",
    github: githubUrl,
    demo: "#",
  },
  {
    title: "ICT Portfolio Projects",
    category: "Web Development",
    description:
      "A collection of responsive front-end and full-stack projects demonstrating React, Next.js, Django, databases and practical UI/UX design work.",
    technologies: ["React", "Next.js", "Django", "Figma", "MySQL"],
    image: "/images/portfolio-2.webp",
    filter: "filter-web",
    github: githubUrl,
    demo: "#",
  },
  {
    title: "Technical Support Dashboard",
    category: "System & Support",
    description:
      "A practical support-oriented dashboard for equipment tracking, troubleshooting workflows and service logs.",
    technologies: ["Node.js", "MySQL", "JavaScript", "UI/UX"],
    image: "/images/portfolio-11.webp",
    filter: "filter-motion",
    github: githubUrl,
    demo: "#",
  },
];

export const testimonials = [
  {
    quote:
      "I build practical digital solutions that combine clean user experience, strong technical implementation and reliable problem solving.",
    author: "antoh",
    role: "Software Developer",
    image: "/images/person-m-7.webp",
    highlightTitle: "Build with clarity and reliability",
  },
  {
    quote:
      "My work blends software development with real-world ICT support, helping users and organisations get reliable and responsive digital systems.",
    author: "antoh",
    role: "Full-Stack Developer",
    image: "/images/person-f-8.webp",
    highlightTitle: "Practical technology for real needs",
  },
  {
    quote:
      "I focus on responsive, maintainable solutions that are intuitive for users and sustainable for the systems behind them.",
    author: "antoh",
    role: "Software Developer",
    image: "/images/person-m-9.webp",
    highlightTitle: "User-centered, technically solid delivery",
  },
  {
    quote:
      "The project was approached with patience and precision. Every technical detail was explained clearly and delivered on time.",
    author: "Miriam K.",
    role: "Project Coordinator",
    image: "/images/person-f-5.webp",
    highlightTitle: "Clear communication from start to finish",
  },
  {
    quote:
      "The final interface is clean, responsive and easy for our team to use. It feels thoughtful on both desktop and mobile.",
    author: "Daniel O.",
    role: "Business Owner",
    image: "/images/person-m-7.webp",
    highlightTitle: "A polished experience for our users",
  },
  {
    quote:
      "From database planning to the finished frontend, the work was practical, organised and focused on solving the real problem.",
    author: "Grace W.",
    role: "Operations Lead",
    image: "/images/person-f-10.webp",
    highlightTitle: "Reliable thinking behind the solution",
  },
  {
    quote:
      "The technical support was dependable and easy to understand. Issues were diagnosed carefully and resolved with lasting improvements.",
    author: "Peter M.",
    role: "ICT Administrator",
    image: "/images/person-m-9.webp",
    highlightTitle: "Support that keeps work moving",
  },
  {
    quote:
      "A strong balance of design and engineering. The result looks professional while remaining fast and straightforward to maintain.",
    author: "Aisha N.",
    role: "Product Designer",
    image: "/images/person-f-8.webp",
    highlightTitle: "Design and engineering in balance",
  },
  {
    quote:
      "The solution gave our team a much clearer workflow and made everyday tasks easier to manage.",
    author: "Samuel T.",
    role: "Team Manager",
    image: "/images/person-m-7.webp",
    highlightTitle: "Technology that improves the daily work",
  },
];

export const services = [
  {
    title: "Full-Stack Web Development",
    description: "End-to-end digital solutions using modern frontend and backend technologies.",
    icon: "activity",
  },
  {
    title: "Frontend Development",
    description: "Responsive, interactive user interfaces built with React, Next.js and accessible UI patterns.",
    icon: "easel",
  },
  {
    title: "Backend Development",
    description: "Secure and scalable application logic using Python, Django and related backend frameworks.",
    icon: "broadcast",
  },
  {
    title: "UI/UX Design",
    description: "Wireframes, prototypes and user-centred design thinking for digital products and interfaces.",
    icon: "bounding-box-circles",
  },
  {
    title: "Database Development",
    description: "Database design, schema planning and data-driven application support with MySQL and PostgreSQL.",
    icon: "database",
  },
  {
    title: "ICT Technical Support",
    description: "Computer maintenance, troubleshooting, system installation and technical help for end users and teams.",
    icon: "pc-display",
  },
];

export const faqItems = [
  {
    question: "What kind of development work do you focus on?",
    answer:
      "I focus on modern web development, especially React and Next.js applications, along with Python and Django backend solutions for practical business and organisational needs.",
  },
  {
    question: "Do you work on both frontend and backend systems?",
    answer:
      "Yes. I develop full-stack solutions, combining responsive front-end interfaces with backend logic, APIs and database integration.",
  },
  {
    question: "How do your ICT and technical support skills complement your software work?",
    answer:
      "They help me build reliable, user-friendly and maintainable systems while also supporting the infrastructure, troubleshooting and day-to-day technical needs behind them.",
  },
  {
    question: "Can you help with UI/UX design as well as code implementation?",
    answer:
      "Yes. I can work from concept to interface design and implementation, using Figma, wireframes and responsive UI thinking to support the product process.",
  },
  {
    question: "Are you comfortable with networking and system support work?",
    answer:
      "Yes. I have practical experience in computer networking, troubleshooting, infrastructure support, fibre optic activities and technical support operations.",
  },
  {
    question: "What makes your profile different from a standard template portfolio?",
    answer:
      "It reflects a combination of software engineering, digital design, and real ICT technical experience, which allows me to deliver practical solutions across web development and system support.",
  },
];

export const socialLinks = [
  { label: "GitHub", href: githubUrl, icon: "github" },
  { label: "Email", href: "mailto:antonygichira203@gmail.com", icon: "envelope" },
];

export const contactDetails = {
  name: "antoh",
  course: "Computer Science",
  title: "Software Developer",
  email: "antonygichira203@gmail.com",
  phone: "0726815333",
  github: githubUrl,
};
