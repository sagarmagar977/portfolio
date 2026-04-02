import { getPortfolioData, type PortfolioData } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile: PortfolioData | null = await getPortfolioData();

  if (!profile) {
    return (
      <main className="full-height d-flex align-items-center justify-content-center px-4 text-center">
        <div>
          <h1>Portfolio data not found</h1>
          <p>Run the seed step to load the initial portfolio content.</p>
        </div>
      </main>
    );
  }

  const phoneHref = profile.contactInfo?.phone
    ? `tel:${profile.contactInfo.phone.replace(/\s+/g, "")}`
    : "#contact";

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container flex-lg-column">
          <a className="navbar-brand mx-lg-auto mb-lg-4" href="#home">
            <span className="h3 fw-bold d-block d-lg-none">{profile.fullName}</span>
            <img
              src={profile.profileImageUrl ?? "/assets/images/person.jpg"}
              className="d-none d-lg-block rounded-circle"
              alt={profile.fullName}
            />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto flex-lg-column text-lg-center">
              <li className="nav-item"><a className="nav-link" href="#home">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#work">Work</a></li>
              <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div id="content-wrapper">
        <section id="home" className="full-height px-lg-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-10">
                <h1 className="display-4 fw-bold" data-aos="fade-up">
                  {profile.heroTitlePrefix} <span className="text-brand">{profile.heroHighlight}</span>{" "}
                  {profile.heroTitleSuffix}
                </h1>
                <p className="lead mt-2 mb-4" data-aos="fade-up" data-aos-delay="300">
                  {profile.heroDescription}
                </p>
                <div className="d-flex flex-column flex-sm-row" data-aos="fade-up" data-aos-delay="600">
                  <a href="#work" className="btn btn-brand mb-3 mb-sm-0 me-sm-3">
                    Explore My Work
                  </a>
                  <a href={phoneHref} className="link-custom text-center text-sm-start">
                    Call: {profile.contactInfo?.phone ?? "Contact me"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="full-height px-lg-5">
          <div className="container">
            <div className="row pb-4" data-aos="fade-up">
              <div className="col-lg-8">
                <h6 className="text-brand">SERVICES</h6>
                <h1>Services That I Provide</h1>
              </div>
            </div>
            <div className="row gy-4">
              {profile.services.map((service: PortfolioData["services"][number], index: number) => (
                <div
                  key={service.id}
                  className="col-md-4"
                  data-aos="fade-up"
                  data-aos-delay={index * 300}
                >
                  <div className="service p-4 bg-base rounded-4 shadow-effect">
                    <div className="iconbox rounded-4">
                      <i className={service.iconName ?? "las la-star"} />
                    </div>
                    <h5 className="mt-4 mb-2">{service.title}</h5>
                    <p>{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="full-height px-lg-5">
          <div className="container">
            <div className="row pb-4" data-aos="fade-up">
              <div className="col-lg-8">
                <h6 className="text-brand">WORK</h6>
                <h1>My Recent Projects</h1>
              </div>
            </div>
            <div className="row gy-4">
              {profile.projects.map((project: PortfolioData["projects"][number]) => (
                <div key={project.id} className="col-md-6" data-aos="fade-up">
                  <div className="card-custom rounded-4 bg-base shadow-effect">
                    <div className="card-custom-image rounded-4">
                      <img className="rounded-4" src={project.imageUrl ?? ""} alt={project.title} />
                    </div>
                    <div className={`card-custom-content p-4${project.liveUrl ? " text-center" : ""}`}>
                      <h4>{project.title}</h4>
                      <p>{project.description}</p>
                      {project.liveUrl ? (
                        <a href={project.liveUrl} className="btn btn-download" target="_blank" rel="noopener noreferrer">
                          Visit
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}

              {profile.beats.map((beat: PortfolioData["beats"][number]) => (
                <div key={beat.id} className="col-md-6" data-aos="fade-up">
                  <div className="card-custom rounded-4 bg-base shadow-effect">
                    <div className="card-custom-image rounded-4">
                      <img className="rounded-4" src={beat.coverImageUrl ?? ""} alt={beat.title} />
                    </div>
                    <div className="card-custom-content p-4">
                      <h4>{beat.title}</h4>
                      <p>{beat.description}</p>
                      {beat.audioUrl ? (
                        <audio controls>
                          <source src={beat.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="full-height px-lg-5">
          <div className="container">
            <div className="row pb-4" data-aos="fade-up">
              <div className="col-lg-8">
                <h6 className="text-brand">ABOUT</h6>
                <h1>{profile.aboutSectionTitle ?? "My Education & Experiance"}</h1>
              </div>
            </div>

            <div className="row gy-5">
              <div className="col-lg-6">
                <h3 className="mb-4" data-aos="fade-up" data-aos-delay="300">Education</h3>
                <div className="row gy-4">
                  {profile.educations.map((education: PortfolioData["educations"][number]) => (
                    <div key={education.id} className="col-12" data-aos="fade-up" data-aos-delay="600">
                      <div className="bg-base p-4 rounded-4 shadow-effect">
                        <h4>{education.degree}</h4>
                        <p className="text-brand mb-2">{education.institution}({education.period})</p>
                        {education.description ? <p className="mb-0">{education.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-6">
                <h3 className="mb-4" data-aos="fade-up" data-aos-delay="300">Experiance</h3>
                <div className="row gy-4">
                  {profile.experiences.map((experience: PortfolioData["experiences"][number]) => (
                    <div key={experience.id} className="col-12" data-aos="fade-up" data-aos-delay="600">
                      <div className="bg-base p-4 rounded-4 shadow-effect">
                        <h4>{experience.role}</h4>
                        <p className="text-brand mb-2">{experience.company} ({experience.period})</p>
                        {experience.description ? <p className="mb-0">{experience.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="row justify-content-center" data-aos="fade-up" data-aos-delay="600">
              <div className="col-12 text-center mt-4">
                <a href={profile.cvFileUrl ?? "#"} className="btn btn-download">
                  Download My CV
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="full-height px-lg-5">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-8 pb-4" data-aos="fade-up">
                <h6 className="text-brand">{profile.contactInfo?.sectionLabel ?? "CONTACT"}</h6>
                <h1>{profile.contactInfo?.heading ?? "Interested in working together? Let's talk"}</h1>
              </div>

              <div className="col-lg-8" data-aos="fade-up" data-aos-delay="300">
                <form className="row g-lg-3 gy-3">
                  <div className="form-group col-md-6">
                    <input type="text" className="form-control" placeholder="Enter your name" />
                  </div>
                  <div className="form-group col-md-6">
                    <input type="email" className="form-control" placeholder="Enter your email" />
                  </div>
                  <div className="form-group col-12">
                    <input type="text" className="form-control" placeholder="Enter subject" />
                  </div>
                  <div className="form-group col-12">
                    <textarea rows={4} className="form-control" placeholder="Enter your message" />
                  </div>
                  <div className="form-group col-12 d-grid">
                    <button type="submit" className="btn btn-brand">Contact me</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-5 px-lg-5">
          <div className="container">
            <div className="row gy-4 justify-content-between">
              <div className="col-auto">
                <p className="mb-0">
                  {profile.footerCreditText ?? "Designed by"}{" "}
                  <a href="#home" className="fw-bold">{profile.fullName.toUpperCase()}</a>
                </p>
              </div>
              <div className="col-auto">
                <div className="social-icons">
                  {profile.socialLinks.map((socialLink: PortfolioData["socialLinks"][number]) => (
                    <a
                      key={socialLink.id}
                      href={socialLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={socialLink.platform}
                    >
                      <i className={socialLink.platform === "linkedin" ? "lab la-linkedin" : "lab la-github"} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}


