import { contactDetails } from "@/data/siteContent";

export function Contact() {
  return (
    <section id="contact" className="contact section light-background">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="contact-intro content" data-aos="fade-up" data-aos-delay="200">
          <div className="section-category mb-3">Contact Me</div>
          <h2 className="display-5 mb-4">I&apos;d love to hear about your next project.</h2>
          <p className="lead mb-4">I am available for web development, technical support, UI/UX work, systems support and digital projects that need thoughtful design and solid implementation.</p>
        </div>

        <div className="contact-info" data-aos="fade-up" data-aos-delay="250">
          <div className="row g-4">
            <div className="col-sm-6 col-lg-4">
              <a className="info-item" href={`mailto:${contactDetails.email}`}>
                <i className="bi bi-envelope-at" aria-hidden="true" />
                <span><strong>Email me</strong>{contactDetails.email}</span>
              </a>
            </div>
            <div className="col-sm-6 col-lg-4">
              <a className="info-item" href={`tel:${contactDetails.phone}`}>
                <i className="bi bi-telephone" aria-hidden="true" />
                <span><strong>Call me</strong>{contactDetails.phone}</span>
              </a>
            </div>
            <div className="col-sm-6 col-lg-4">
              <a className="info-item" href={contactDetails.github} target="_blank" rel="noopener noreferrer">
                <i className="bi bi-github" aria-hidden="true" />
                <span><strong>Find me on GitHub</strong>{contactDetails.github}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form" data-aos="fade-up" data-aos-delay="300">
          <div className="contact-form-header">
            <span className="section-category">Send me a message</span>
            <h3>Tell me how I can help.</h3>
          </div>
          <form className="php-email-form">
            <div className="row g-4">
              <div className="col-md-6">
                <label htmlFor="contact-name">Your name</label>
                <input id="contact-name" type="text" name="name" className="form-control" placeholder="Enter your name" required />
              </div>
              <div className="col-md-6">
                <label htmlFor="contact-email">Your email</label>
                <input id="contact-email" type="email" name="email" className="form-control" placeholder="Enter your email" required />
              </div>
              <div className="col-12">
                <label htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" type="text" name="subject" className="form-control" placeholder="What would you like to discuss?" required />
              </div>
              <div className="col-12">
                <label htmlFor="contact-message">Your message</label>
                <textarea id="contact-message" className="form-control" name="message" rows={6} placeholder="Write your message here" required />
              </div>
              <div className="col-12">
                <div className="loading">Loading</div>
                <div className="error-message" />
                <div className="sent-message">Your message has been sent. Thank you!</div>
                <button type="submit" className="btn btn-submit">Send my message <i className="bi bi-arrow-up-right" aria-hidden="true" /></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
