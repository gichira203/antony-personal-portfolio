import { skillGroups } from "@/data/siteContent";

export function Skills() {
  return (
    <section id="skills" className="skills section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-4 skills-animation">
          {skillGroups.map((group, index) => (
            <div key={group.name} className="col-sm-4" data-aos="fade-up" data-aos-delay={String((index + 1) * 100)}>
              <div className="skill-box">
                <h3>{group.name}</h3>
                <span className="text-end d-block">{group.percent}%</span>
                <div className="progress" aria-label={`${group.name} skill progress`}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    aria-valuenow={group.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ width: `${group.percent}%` }}
                  />
                </div>
                <ul className="skill-list">
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
