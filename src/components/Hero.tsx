import Link from "next/link";
import { heroStats } from "@/data/siteContent";

export function Hero() {
  return (
    <>
      <section id="home" className="hero section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row align-items-center content">
          <div className="col-lg-6" data-aos="fade-right" data-aos-delay="200">
            <div className="hero-video-card">
              <video className="hero-video" autoPlay muted loop playsInline aria-label="Programming video">
                <source src="/images/hero%20video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
            <div className="hero-text-card">
              <h2>
                antoh <span className="hero-name-subtitle">— Software Developer</span>
              </h2>
              <p className="lead">
                I am a Software Developer focused on building modern, responsive and user-friendly web applications. My main development stack includes React, Next.js, JavaScript, Python and Django, with additional experience in UI/UX design, networking, computer maintenance and technical support.
              </p>
              <div className="cta-buttons" data-aos="fade-up" data-aos-delay="300">
                <Link href="#portfolio" className="btn btn-primary">
                  View My Work
                </Link>
                <Link href="#contact" className="btn btn-outline">
                  Let&apos;s Connect
                </Link>
              </div>
              <div className="hero-stats" data-aos="fade-up" data-aos-delay="400">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="stat-item">
                    <span className="stat-number">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      <section className="hero-proof" aria-label="Professional highlights">
        <div className="container">
          <dl className="hero-proof-list">
            <div className="hero-proof-item">
              <dt>5+</dt>
              <dd>Years Experience</dd>
            </div>
            <div className="hero-proof-item">
              <dt>100+</dt>
              <dd>Projects Completed</dd>
            </div>
            <div className="hero-proof-item">
              <dt>60+</dt>
              <dd>Clients Served</dd>
            </div>
            <div className="hero-proof-item">
              <dt>5</dt>
              <dd>Technologies</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
