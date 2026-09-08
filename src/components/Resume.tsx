import { education, workExperience } from "@/data/siteContent";

export function Resume() {
  return (
    <section id="resume" className="resume section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Resume</h2>
        <div className="title-shape" aria-hidden="true">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,10 C 40,0 60,20 100,10 C 140,0 160,20 200,10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p>
          Software development, ICT support, networking and full-stack problem solving built around practical digital solutions.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row">
          <div className="col-12">
            <div className="resume-wrapper">
              <div className="resume-block" data-aos="fade-up">
                <h2>Professional Experience</h2>
                <p className="lead">Software development, full-stack web work, systems support, and technical operations in ICT environments.</p>

                <div className="timeline">
                  {workExperience.map((job, index) => (
                    <div key={`${job.company}-${job.period}`} className="timeline-item" data-aos="fade-up" data-aos-delay={String((index + 1) * 100)}>
                      <div className="timeline-left">
                        <h4 className="company">{job.company}</h4>
                        <span className="period">{job.period}</span>
                      </div>
                      <div className="timeline-dot" aria-hidden="true" />
                      <div className="timeline-right">
                        <h3 className="position">{job.title}</h3>
                        <p className="description">{job.description}</p>
                        {job.bullets ? (
                          <ul>
                            {job.bullets.map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="resume-block" data-aos="fade-up" data-aos-delay="100">
                <h2>Training & Certifications</h2>
                <p className="lead">Relevant professional development in web development, networking and cybersecurity.</p>

                <div className="timeline">
                  {education.map((item, index) => (
                    <div key={`${item.school}-${item.period}`} className="timeline-item" data-aos="fade-up" data-aos-delay={String((index + 1) * 100)}>
                      <div className="timeline-left">
                        <h4 className="company">{item.school}</h4>
                        <span className="period">{item.period}</span>
                      </div>
                      <div className="timeline-dot" aria-hidden="true" />
                      <div className="timeline-right">
                        <h3 className="position">{item.degree}</h3>
                        <p className="description">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
