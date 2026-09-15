"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PublicTestimonial {
  quote: string;
  author: string;
  role: string;
  image: string;
  highlightTitle: string;
}

async function fetchTestimonialsFromDb(): Promise<PublicTestimonial[]> {
  try {
    const res = await fetch("http://localhost:3001/api/testimonials");
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json() as any[];
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
    return data
      .filter((t: any) => t.published)
      .map((t: any) => ({
        quote: t.quote || "",
        author: t.author || "",
        role: t.role || "",
        image: t.image || "/images/person-m-7.webp",
        highlightTitle: t.highlightTitle || "",
      }));
  } catch {
    return [
      {
        quote: "I build practical digital solutions that combine clean user experience, strong technical implementation and reliable problem solving.",
        author: "antoh",
        role: "Software Developer",
        image: "/images/person-m-7.webp",
        highlightTitle: "Build with clarity and reliability",
      },
    ];
  }
}

function toPages(items: PublicTestimonial[]): PublicTestimonial[][] {
  return items.reduce<PublicTestimonial[][]>((pages, item, index) => {
    const pageIndex = Math.floor(index / 3);
    pages[pageIndex] ??= [];
    pages[pageIndex].push(item);
    return pages;
  }, []);
}

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pages, setPages] = useState<PublicTestimonial[][]>([]);

  useEffect(() => {
    fetchTestimonialsFromDb().then((items) => setPages(toPages(items)));
  }, []);

  useEffect(() => {
    if (pages.length === 0) return;
    const rotation = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % pages.length);
    }, 5000);
    return () => window.clearInterval(rotation);
  }, [pages.length]);

  const goToPrevious = () => setActiveIndex((value) => (value - 1 + pages.length) % pages.length);
  const goToNext = () => setActiveIndex((value) => (value + 1) % pages.length);

  if (pages.length === 0) return null;

  return (
    <section id="testimonials" className="testimonials section light-background">
      <div className="container section-title" data-aos="fade-up">
        <h2>Testimonials</h2>
        <div className="title-shape" aria-hidden="true">
          <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,10 C 40,0 60,20 100,10 C 140,0 160,20 200,10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p>
          A practical, user-focused approach to development, design and technical support that keeps the final product reliable and effective.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="testimonials-slider">
          <div
            className="testimonials-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {pages.map((page, pageIndex) => (
              <div className="testimonial-slide" key={`testimonial-page-${pageIndex}`}>
                {page.map((testimonial, idx) => (
                  <article className="testimonial-item" key={`${testimonial.author}-${idx}-${pageIndex}`}>
                    <div className="testimonial-rating" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span className="bi bi-star-fill" aria-hidden="true" key={index} />
                      ))}
                    </div>
                    <p>{testimonial.quote}</p>
                    <div className="profile d-flex align-items-center">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        width={60}
                        height={60}
                        className="profile-img"
                      />
                      <div className="profile-info">
                        <h3>{testimonial.author}</h3>
                        <span>{testimonial.role}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>

          <div className="swiper-navigation d-flex align-items-center justify-content-center">
            <button
              type="button"
              className="swiper-button-prev"
              aria-label="Previous testimonial"
              onClick={goToPrevious}
            />
            <button
              type="button"
              className="swiper-button-next"
              aria-label="Next testimonial"
              onClick={goToNext}
            />
          </div>
        </div>
      </div>
    </section>
  );
}