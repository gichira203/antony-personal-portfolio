import Image from "next/image";
import { personalCards } from "@/data/siteContent";

export function About() {
  return (
    <section id="about" className="about section light-background">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="about-subtitle" data-aos="fade-up">
          <span className="subtitle">About Me</span>
        </div>
        <div className="about-content">
          <div className="about-image" data-aos="fade-right" data-aos-delay="200">
            <Image src="/images/profile-square-2.png" alt="Profile Image" width={400} height={400} className="rounded-4" style={{ objectPosition: "50% 25%" }} />
          </div>
          <div className="about-text" data-aos="fade-left" data-aos-delay="300">
            <h2>Software Developer &amp; ICT Technical Specialist</h2>
            <p className="lead mb-4">
              I am antoh, a Software Developer focused on full-stack web development, modern user interfaces, database-driven applications and practical ICT support.
            </p>
            <p className="mb-4">
              My work combines frontend and backend development with real-world troubleshooting, networking, maintenance and user support. I enjoy solving technical problems, building clean and responsive digital experiences, and delivering solutions that are both functional and easy to use.
            </p>

            <div className="personal-info-cards">
              <div className="personal-info-cards__grid">
                {personalCards.map((card) => (
                  <div className="personal-info-cards__card" key={card.label}>
                    <span className="personal-info-cards__label">{card.label}</span>
                    <span className="personal-info-cards__value">
                      {card.href ? (
                        <a href={card.href}>{card.value}</a>
                      ) : (
                        card.value
                      )}
                    </span>
                  </div>
                ))}
                <div className="personal-info-cards__card" key="linkedin-card">
                    <span className="personal-info-cards__label">LinkedIn</span>
                    <span className="personal-info-cards__value">Antony Muthii</span>
                  </div>
                  <div className="personal-info-cards__card" key="linkedin-profile-card">
                    <span className="personal-info-cards__label">LinkedIn Profile</span>
                    <span className="personal-info-cards__value">
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        Visit LinkedIn Account
                      </a>
                    </span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
