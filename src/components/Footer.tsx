import Image from "next/image";
import { socialLinks } from "@/data/siteContent";

export function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <Image src="/images/logo.jpg" alt="antoh logo" width={54} height={54} className="footer-logo" />
            </div>
            <h3>antoh</h3>
            <p>Software Developer | Computer Science</p>
            <p className="footer-contact"><a href="tel:0726815333">Phone: 0726815333</a></p>
            <p className="footer-contact"><a href="mailto:antonygichira203@gmail.com">Email: antonygichira203@gmail.com</a></p>
          </div>

          <div className="footer-column">
            <h4>Quick Navigation</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#resume">Resume</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#portfolio">Projects</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Professional Links</h4>
            <ul className="footer-links">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>© 2026 antoh. All Rights Reserved.</p>
            <p className="copyright-sub">Software Developer | Computer Science</p>
          </div>

          <div className="social-links d-flex justify-content-center">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} aria-label={link.label} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                <i className={`bi bi-${link.icon}`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
