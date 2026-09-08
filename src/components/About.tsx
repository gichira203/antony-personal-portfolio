import Image from "next/image";
import { personalInfo } from "@/data/siteContent";

export function About() {
  return (
    <section id="about" className="about section light-background">
      <div className="container section-title" data-aos="fade-up">
        <h2>About</h2>
        <div className="title-shape" aria-hidden="true">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,10 C 40,0 60,20 100,10 C 140,0 160,20 200,10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p>
          I design and develop practical digital solutions that combine software engineering, user experience and reliable technical support.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row align-items-center">
          <div className="col-lg-6 position-relative" data-aos="fade-right" data-aos-delay="200">
            <div className="about-image">
              <Image src="/images/profile-square-2.webp" alt="Profile Image" width={670} height={760} className="rounded-4" />
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
            <div className="about-content">
              <span className="subtitle">About Me</span>
              <h2>Software Developer &amp; ICT Technical Specialist</h2>
              <p className="lead mb-4">
                I am antoh, a Software Developer focused on full-stack web development, modern user interfaces, database-driven applications and practical ICT support.
              </p>
              <p className="mb-4">
                My work combines frontend and backend development with real-world troubleshooting, networking, maintenance and user support. I enjoy solving technical problems, building clean and responsive digital experiences, and delivering solutions that are both functional and easy to use.
              </p>

              <div className="personal-info">
                <div className="row g-4">
                  {personalInfo.map((item) => (
                    <div className="col-6" key={item.label}>
                      <div className="info-item">
                        <span className="label">{item.label}</span>
                        {item.label === "Phone" ? (
                          <a className="value" href={`tel:${item.value}`}>{item.value}</a>
                        ) : item.label === "Email" ? (
                          <a className="value" href={`mailto:${item.value}`}>{item.value}</a>
                        ) : (
                          <span className="value">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="signature mt-4">
                <div className="signature-image">
                  <Image src="/images/signature-1.webp" alt="Signature" width={180} height={80} />
                </div>
                <div className="signature-info">
                  <h4>antoh</h4>
                  <p>Software Developer | Computer Science</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
