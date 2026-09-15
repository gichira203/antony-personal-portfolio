"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PublicProject {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  image: string;
  filter: string;
  github: string;
  demo: string;
}

async function fetchProjectsFromDb(): Promise<PublicProject[]> {
  try {
    const res = await fetch("http://localhost:3001/api/projects");
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json() as any[];
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
    return data.map((p: any) => ({
      title: p.title || "",
      category: p.category || "",
      description: p.description || "",
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "/images/portfolio-1.webp",
      filter: "filter-web",
      github: p.github || "",
      demo: p.demo || "#",
    }));
  } catch {
    // Fall back to in-memory defaults only when DB is unreachable.
    return (await import("@/data/siteContent")).projects as unknown as PublicProject[];
  }
}

const filters = [
  { label: "All Work", value: "*", active: true },
  { label: "Web Design", value: ".filter-web" },
  { label: "Graphics", value: ".filter-graphics" },
  { label: "Motion", value: ".filter-motion" },
  { label: "Branding", value: ".filter-brand" },
];

export function Portfolio() {
  const [projects, setProjects] = useState<PublicProject[]>([]);

  useEffect(() => {
    fetchProjectsFromDb().then(setProjects);
  }, []);

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Portfolio</h2>
        <div className="title-shape" aria-hidden="true">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,10 C 40,0 60,20 100,10 C 140,0 160,20 200,10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p>
          A selection of web projects, platform builds and technical solutions covering full-stack development, UI/UX and practical ICT support.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">
          <div className="portfolio-filters-container" data-aos="fade-up" data-aos-delay="200">
            <ul className="portfolio-filters isotope-filters">
              {filters.map((filter) => (
                <li key={filter.label} data-filter={filter.value} className={filter.active ? "filter-active" : ""}>
                  {filter.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="row g-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
            {projects.map((project) => (
              <div key={project.title} className={`col-sm-4 portfolio-item isotope-item ${project.filter}`}>
                <div className="portfolio-card">
                  <div className="portfolio-image">
                    <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="portfolio-overlay">
                      <div className="portfolio-actions">
                        <a href={project.image} className="preview-link" aria-label={`View ${project.title}`}>
                          <span className="bi bi-eye" aria-hidden="true" />
                        </a>
                        <a href="#portfolio" className="details-link" aria-label={`Details for ${project.title}`}>
                          <span className="bi bi-arrow-right" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="portfolio-content">
                    <span className="category">{project.category}</span>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="project-meta">
                      <strong>Tech:</strong> {project.technologies.join(", ")}
                    </div>
                    <div className="project-links">
                      <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                      <a href={project.demo}>Demo</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
