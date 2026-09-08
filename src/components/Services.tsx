import { services } from "@/data/siteContent";

export function Services() {
  return (
    <section id="services" className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Services</h2>
        <div className="title-shape" aria-hidden="true">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,10 C 40,0 60,20 100,10 C 140,0 160,20 200,10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p>
          Practical development, design and technical support services for modern digital products and business systems.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row align-items-center">
          <div className="col-lg-4 mb-5 mb-lg-0">
            <h2 className="fw-bold mb-4 servies-title">Digital solutions built for performance, usability and support.</h2>
            <p className="mb-4">From web applications and design systems to infrastructure support and troubleshooting, I help turn technical requirements into reliable solutions.</p>
            <a href="#contact" className="btn btn-outline-primary">See all services</a>
          </div>

          <div className="col-lg-8">
            <div className="row g-4">
              {services.map((service, index) => (
                <div key={service.title} className="col-sm-4" data-aos="fade-up" data-aos-delay={String((index + 2) * 100)}>
                  <div className="service-item">
                    <i className={`bi bi-${service.icon} icon`} aria-hidden="true" />
                    <h3>
                      <a href="#services">{service.title}</a>
                    </h3>
                    <p>{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
