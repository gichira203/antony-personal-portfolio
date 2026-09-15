"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { heroStats } from "@/data/siteContent";

const careerTitles = [
  "a Software Developer",
  "a UI/UX Designer",
  "a Network Engineer",
  "a IT Support Engineer",
  "a Maintenance Engineer",
];

export function Hero() {
  const [careerIndex, setCareerIndex] = useState(0);
  const [typedCareer, setTypedCareer] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  const coloredCareer = typedCareer.split("").map((letter, i) => (
    <span key={i} style={{ color: "var(--accent-color)", fontSize: "1.4em" }}>
      {letter}
    </span>
  ));

  useEffect(() => {
    const career = careerTitles[careerIndex];
    const typingDuration = career.length * 200;
    let characterIndex = 0;
    let typingTimer: number | undefined;

    const startTimer = window.setTimeout(() => {
      setTypedCareer("");
      setIsExiting(false);
      typingTimer = window.setInterval(() => {
        characterIndex += 1;
        setTypedCareer(career.slice(0, characterIndex));
        if (characterIndex === career.length && typingTimer !== undefined) {
          window.clearInterval(typingTimer);
        }
      }, 200);
    }, 0);
    const exitTimer = window.setTimeout(() => setIsExiting(true), typingDuration + 1700);
    const nextTimer = window.setTimeout(() => {
      setCareerIndex((currentIndex) => (currentIndex + 1) % careerTitles.length);
    }, typingDuration + 2150);

    return () => {
      window.clearTimeout(startTimer);
      if (typingTimer !== undefined) {
        window.clearInterval(typingTimer);
      }
      window.clearTimeout(exitTimer);
      window.clearTimeout(nextTimer);
    };
  }, [careerIndex]);

  return (
    <>
      <section id="home" className="hero section">
        <div className="container hero-layout" data-aos="fade-up" data-aos-delay="100">
          <div className="hero-image-card" data-aos="fade-right" data-aos-delay="150">
            <Image
              className="hero-media-image"
              src="/images/Hero%20image.png"
              alt="Antony working at a computer"
              fill
              preload
              sizes="(max-width: 991px) 100vw, 50vw"
            />
          </div>

          <div className="hero-content" data-aos="fade-left" data-aos-delay="250">
            <div className="hero-text-card">
              <h1 className="hero-name">Hello, I am antony</h1>
              <p className="hero-role" aria-live="polite">
                <span
                  className={`hero-career${isExiting ? " is-exiting" : ""}`}
                >
                  {coloredCareer}
                </span>
              </p>
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
