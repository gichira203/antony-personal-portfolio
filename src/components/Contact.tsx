"use client";

import { useState } from "react";
import { contactDetails } from "@/data/siteContent";

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", phone: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="contact section light-background">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="contact-intro content" data-aos="fade-up" data-aos-delay="200">
          <div className="section-category mb-3">Contact Me</div>
          <h2 className="display-5 mb-4">I&apos;d love to hear about your next project.</h2>
          <p className="lead mb-4">
            I am available for web development, technical support, UI/UX work, systems support
            and digital projects that need thoughtful design and solid implementation.
          </p>
        </div>

        {/* Contact info cards */}
        <div className="contact-info" data-aos="fade-up" data-aos-delay="250">
          <div className="row g-4">
            <div className="col-sm-6 col-lg-4">
              <a className="info-item" href={`mailto:${contactDetails.email}`}>
                <i className="bi bi-envelope-at" aria-hidden="true" />
                <span>
                  <strong>Email me</strong>
                  {contactDetails.email}
                </span>
              </a>
            </div>
            <div className="col-sm-6 col-lg-4">
              <a className="info-item" href={`tel:${contactDetails.phone}`}>
                <i className="bi bi-telephone" aria-hidden="true" />
                <span>
                  <strong>Call me</strong>
                  {contactDetails.phone}
                </span>
              </a>
            </div>
            <div className="col-sm-6 col-lg-4">
              <a
                className="info-item"
                href={contactDetails.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-github" aria-hidden="true" />
                <span>
                  <strong>Find me on GitHub</strong>
                  {contactDetails.github}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Centered form card */}
        <div
          className="contact-form-wrapper"
          data-aos="fade-up"
          data-aos-delay="300"
          style={{ maxWidth: "520px", marginInline: "auto" }}
        >
          <div className="contact-form">
            <div className="contact-form-header">
              <span className="section-category">Send me a message</span>
              <h3>Tell me how I can help.</h3>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Double-row: name + phone on top */}
              <div className="form-row form-row-top">
                <div className="form-field">
                  <label htmlFor="contact-name">Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-phone">Phone Number</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+254 726 815 333"
                  />
                </div>
              </div>

              {/* Email row */}
              <div className="form-row form-row-middle">
                <div className="form-field form-field-full">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Message row */}
              <div className="form-row form-row-bottom">
                <div className="form-field form-field-full">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    required
                  />
                </div>
              </div>

              {/* Submit row */}
              <div className="form-row form-row-submit">
                <div className="form-field form-field-full">
                  <button type="submit" className="btn btn-submit">
                    Send Message
                    <i className="bi bi-arrow-up-right" aria-hidden="true" />
                  </button>
                  {status === "sent" && (
                    <div className="sent-message">Your message has been sent. Thank you!</div>
                  )}
                  {status === "error" && (
                    <div className="error-message">Something went wrong. Please try again.</div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
