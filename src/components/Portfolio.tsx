"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { projects as staticProjects } from "@/data/siteContent";

interface PublicProject {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  images: string[];
  github: string;
  demo: string;
  filter: string;
}

function categoryFilter(category: string): string {
  const c = (category || "").toLowerCase();
  if (/web|app|platform|e-commerce|ecommerce|system|dashboard|full-?stack/.test(c)) {
    return "filter-web";
  }
  if (/motion|animat/.test(c)) return "filter-motion";
  if (/brand/.test(c)) return "filter-brand";
  if (/graphic|design|ui|ux/.test(c)) return "filter-graphics";
  return "filter-web";
}

interface ProjectApiRow {
  id?: string | number;
  title?: string;
  category?: string;
  description?: string;
  technologies?: unknown;
  images?: unknown;
  github?: string;
  demo?: string;
}

async function fetchProjectsFromDb(): Promise<PublicProject[]> {
  const res = await fetch("/api/projects", { cache: "no-store" });
  if (!res.ok) throw new Error("fetch failed");
  const data = (await res.json()) as ProjectApiRow[];
  if (!Array.isArray(data)) throw new Error("invalid response");
  return data.map((p) => ({
    id: String(p.id ?? p.title ?? Math.random()),
    title: p.title || "",
    category: p.category || "",
    description: p.description || "",
    technologies: Array.isArray(p.technologies) ? p.technologies : [],
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/images/portfolio-1.webp"],
    github: p.github || "",
    demo: p.demo || "",
    filter: categoryFilter(p.category || ""),
  }));
}

const filters = [
  { label: "All Work", value: "*" },
  { label: "Web Design", value: "filter-web" },
  { label: "Graphics", value: "filter-graphics" },
  { label: "Motion", value: "filter-motion" },
  { label: "Branding", value: "filter-brand" },
];

export function Portfolio() {
  const [projects, setProjects] = useState<PublicProject[]>(
    staticProjects.map((p, index) => ({
      id: `static-${index}`,
      title: p.title,
      category: p.category,
      description: p.description,
      technologies: p.technologies,
      images: [p.image],
      github: p.github,
      demo: p.demo,
      filter: p.filter,
    }))
  );
  const [activeFilter, setActiveFilter] = useState("*");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const items = await fetchProjectsFromDb();
      setProjects(items);
      setLoaded(true);
    } catch {
      /* transient failure — keep whatever is currently shown */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (!cancelled) void load();
    };

    refresh();

    // Keep the public page in sync with the admin dashboard, even in
    // another tab, device or after the admin saves a project.
    const interval = window.setInterval(refresh, 8000);
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("portfolio-updates");
      channel.onmessage = () => refresh();
    } catch {
      /* BroadcastChannel unavailable — polling still keeps things fresh */
    }

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      channel?.close();
    };
  }, [load]);

  const visibleProjects =
    activeFilter === "*"
      ? projects
      : projects.filter((project) => project.filter === activeFilter);

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Portfolio</h2>
        <div className="title-shape" aria-hidden="true">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 0,10 C 40,0 60,20 100,10 C 140,0 160,20 200,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <p>
          A selection of web projects, platform builds and technical
          solutions covering full-stack development, UI/UX and practical ICT
          support.
        </p>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            marginTop: "0.75rem",
            padding: "0.3rem 0.75rem",
            borderRadius: "999px",
            background: "rgba(46, 204, 113, 0.1)",
            color: "var(--accent-color)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
          title="This section updates automatically when the admin adds or edits a project"
        >
          <span
            aria-hidden="true"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#2ecc71",
              boxShadow: "0 0 0 3px rgba(46, 204, 113, 0.2)",
            }}
          />
          Live
        </span>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div
          className="isotope-layout"
          data-default-filter="*"
          data-layout="masonry"
          data-sort="original-order"
        >
          <div
            className="portfolio-filters-container"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <ul className="portfolio-filters isotope-filters">
              {filters.map((filter) => (
                <li
                  key={filter.label}
                  data-filter={filter.value}
                  className={activeFilter === filter.value ? "filter-active" : ""}
                  onClick={() => setActiveFilter(filter.value)}
                  style={{ cursor: "pointer" }}
                >
                  {filter.label}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="row g-4 isotope-container"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            {visibleProjects.map((project) => (
              <div
                key={project.id}
                className={`col-sm-4 portfolio-item isotope-item ${project.filter}`}
              >
                <div className="portfolio-card">
                  <div className="portfolio-image">
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {project.images.length > 1 && (
                      <span
                        style={{
                          position: "absolute",
                          right: "0.6rem",
                          top: "0.6rem",
                          zIndex: 2,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          background: "rgba(15, 41, 67, 0.75)",
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        +{project.images.length - 1}
                      </span>
                    )}
                    <div className="portfolio-overlay">
                      <div className="portfolio-actions">
                        <a
                          href={project.images[0]}
                          className="preview-link"
                          aria-label={`View ${project.title}`}
                        >
                          <span className="bi bi-eye" aria-hidden="true" />
                        </a>
                        <a
                          href="#portfolio"
                          className="details-link"
                          aria-label={`Details for ${project.title}`}
                        >
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
                      <strong>Tech:</strong>{" "}
                      {project.technologies.join(", ")}
                    </div>
                    <div className="project-links">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>
                      )}
                      {project.demo && project.demo !== "#" && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loaded && visibleProjects.length === 0 && (
            <p style={{ textAlign: "center", padding: "2rem 0", opacity: 0.7 }}>
              No published projects yet. Check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
