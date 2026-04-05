import { ContactForm } from "./contact-form";
import { BeatAudioPlayer } from "./beat-audio-player";
import { PortfolioNav } from "./portfolio-nav";
import { PortfolioScrollControls } from "./portfolio-scroll-controls";
import { PortfolioSectionSnapController } from "./portfolio-section-snap-controller";
import type { PortfolioData } from "@/lib/portfolio";
import { buildPortfolioPresentation } from "@/lib/portfolio-presenter";
import { getSocialPlatformMeta } from "@/lib/social-links";

const STAGGER_STEP = 150;
const STAGGER_MAX = 600;

type ServiceItem = PortfolioData["services"][number];
type ProjectItem = PortfolioData["projects"][number];
type BeatItem = PortfolioData["beats"][number];
type BusinessItem = PortfolioData["businesses"][number];
type PhotoProjectItem = PortfolioData["photoProjects"][number];
type MotionProjectItem = PortfolioData["motionProjects"][number];
type ArtworkItem = PortfolioData["artworks"][number];
type EducationItem = PortfolioData["educations"][number];
type ExperienceItem = PortfolioData["experiences"][number];
type SocialLinkItem = PortfolioData["socialLinks"][number];

function getStaggerDelay(index: number, baseDelay = 0) {
  return baseDelay + Math.min(index * STAGGER_STEP, STAGGER_MAX);
}

export function PortfolioPage({ profile }: { profile: PortfolioData }) {
  return <ClassicPortfolioTemplate profile={profile} />;
}

function ClassicPortfolioTemplate({ profile }: { profile: PortfolioData }) {
  const presentation = buildPortfolioPresentation(profile);
  const sectionIds = presentation.navItems.map((item) => item.href.replace(/^#/, ""));
  const phoneHref = profile.contactInfo?.phone
    ? `tel:${profile.contactInfo.phone.replace(/\s+/g, "")}`
    : "#contact";

  return (
    <>
      <PortfolioNav
        fullName={profile.fullName}
        profileImageUrl={profile.profileImageUrl}
        items={presentation.navItems}
      />
      <PortfolioSectionSnapController sectionIds={sectionIds} />

      <div id="content-wrapper" className="portfolio-scroll-shell">
        <section id="home" className="full-height portfolio-snap-section px-lg-5 px-4 pt-28 lg:pt-20">
          <div className="container">
            <div className="row gy-5 align-items-center">
              <div className="col-12">
                <h1 className="text-[2.75rem] font-bold leading-[1.03] sm:text-[3.7rem] lg:max-w-5xl lg:text-[4.15rem]" data-aos="fade-up">
                  {profile.heroTitlePrefix} <span className="text-brand">{profile.heroHighlight}</span>{" "}
                  {profile.heroTitleSuffix}
                </h1>
                <p className="mt-2 mb-4 max-w-3xl text-[1.08rem] leading-[1.7] text-[var(--color-body)]" data-aos="fade-up" data-aos-delay="300">
                  {profile.heroDescription}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center" data-aos="fade-up" data-aos-delay="600">
                  <a
                    href="#work"
                    className="btn btn-brand"
                  >
                    Explore My Work
                  </a>
                  <a href={phoneHref} className="link-custom text-center text-[1rem] font-bold sm:text-left">
                    Call: {profile.contactInfo?.phone ?? "Contact me"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {presentation.showServices ? (
          <section id="services" className="full-height portfolio-snap-section px-lg-5 px-4">
            <div className="container">
              <SectionHeading eyebrow="SERVICES" title="Services That I Provide" />
              <div className="grid gap-6 md:grid-cols-3">
                {profile.services.map((service: ServiceItem, index: number) => (
                  <div key={service.id} data-aos="fade-up" data-aos-delay={getStaggerDelay(index)}>
                    <div className="h-full rounded-2xl bg-[var(--color-base)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition duration-500 hover:shadow-[-6px_6px_0_0_var(--color-brand)]">
                      <div className="iconbox rounded-4">
                        <i className={service.iconName ?? "las la-star"} />
                      </div>
                      <h5 className="mb-2 mt-4 text-[1.55rem] leading-[1.15]">{service.title}</h5>
                      <p className="text-[1.02rem] leading-[1.75]">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <WorkSection profile={profile} />

        {profile.educations.length > 0 || profile.experiences.length > 0 ? (
          <section id="about" className="full-height portfolio-snap-section px-lg-5 px-4">
            <div className="container">
              <SectionHeading eyebrow="ABOUT" title={profile.aboutSectionTitle ?? "My Education & Experience"} />

              <div className="grid gap-12 lg:grid-cols-2">
                {profile.educations.length > 0 ? (
                  <div>
                    <h3 className="mb-4" data-aos="fade-up" data-aos-delay="300">Education</h3>
                    <div className="space-y-6">
                      {profile.educations.map((education: EducationItem, index: number) => (
                        <div key={education.id} data-aos="fade-up" data-aos-delay={getStaggerDelay(index, 450)}>
                          <div className="rounded-2xl bg-[var(--color-base)] p-6 transition duration-500 hover:shadow-[-6px_6px_0_0_var(--color-brand)]">
                            <h4>{education.degree}</h4>
                            <p className="mb-2 text-[var(--color-brand)]">{education.institution} ({education.period})</p>
                            {education.description ? <p>{education.description}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {profile.experiences.length > 0 ? (
                  <div>
                    <h3 className="mb-4" data-aos="fade-up" data-aos-delay="300">Experience</h3>
                    <div className="space-y-6">
                      {profile.experiences.map((experience: ExperienceItem, index: number) => (
                        <div key={experience.id} data-aos="fade-up" data-aos-delay={getStaggerDelay(index, 450)}>
                          <div className="rounded-2xl bg-[var(--color-base)] p-6 transition duration-500 hover:shadow-[-6px_6px_0_0_var(--color-brand)]">
                            <h4>{experience.role}</h4>
                            <p className="mb-2 text-[var(--color-brand)]">{experience.company} ({experience.period})</p>
                            {experience.description ? <p>{experience.description}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {profile.cvFileUrl ? (
                <div className="mt-10 flex justify-center" data-aos="fade-up" data-aos-offset="0" data-aos-delay="600">
                  <div className="w-full text-center">
                    <a
                      href={profile.cvFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-brand"
                    >
                      Download My CV
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <ContactSection profile={profile} />
        <PortfolioFooter profile={profile} />
      </div>
      <PortfolioScrollControls />
    </>
  );
}
function WorkSection({ profile }: { profile: PortfolioData }) {
  const presentation = buildPortfolioPresentation(profile);

  if (!presentation.showDeveloperWork && !presentation.showBeats && !presentation.showBusinesses && !presentation.showPhotography && !presentation.showMotion && !presentation.showArtworks) {
    return null;
  }

  const sectionClassName = "full-height px-lg-5 px-4";
  const gridClassName = "grid gap-6 md:grid-cols-2";
  const cardClassName = "overflow-hidden rounded-2xl bg-[var(--color-base)] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition duration-500 hover:shadow-[-6px_6px_0_0_var(--color-brand)]";

  return (
    <section id="work" className={`${sectionClassName} portfolio-snap-section`}>
      <div className="container">
        <SectionHeading eyebrow="WORK" title="My Recent Projects" />
        <div className="space-y-8">
          {presentation.showDeveloperWork ? (
            <div className={gridClassName}>
              {profile.projects.map((project: ProjectItem, index: number) => (
                <article key={project.id} className={cardClassName} data-aos="fade-up" data-aos-delay={getStaggerDelay(index)}>
                  {project.imageUrl ? <img className="portfolio-media-image" src={project.imageUrl} alt={project.title} /> : null}
                  <div className="flex flex-col gap-4 p-6">
                    <h3 className="h4 mb-2">{project.title}</h3>
                    <p>{project.description}</p>
                    {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-brand mt-2 self-start">Visit Project</a> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {presentation.showBeats ? (
            <WorkGroup title="Music" description="">
              <div className={gridClassName}>
                {profile.beats.map((beat: BeatItem, index: number) => (
                  <article key={beat.id} className={cardClassName} data-aos="fade-up" data-aos-delay={getStaggerDelay(index)}>
                    {beat.coverImageUrl ? <img className="portfolio-media-image" src={beat.coverImageUrl} alt={beat.title} /> : null}
                    <div className="flex flex-col gap-4 p-6">
                      <h3 className="h4 mb-2">{beat.title}</h3>
                      <p>{beat.description}</p>
                      {beat.audioUrl ? (
                        <BeatAudioPlayer src={beat.audioUrl} title={beat.title} />
                      ) : null}
                      {beat.externalUrl ? <a href={beat.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light mt-2 self-start">Open Music Link</a> : null}
                    </div>
                  </article>
                ))}
              </div>
            </WorkGroup>
          ) : null}

          {presentation.showBusinesses ? (
            <WorkGroup title="Ventures" description="Business ideas, startups, or creative service brands.">
              <div className={gridClassName}>
                {profile.businesses.map((business: BusinessItem, index: number) => (
                  <article key={business.id} className={cardClassName} data-aos="fade-up" data-aos-delay={getStaggerDelay(index)}>
                    {business.imageUrl ? <img className="portfolio-media-image" src={business.imageUrl} alt={business.name} /> : null}
                    <div className="flex flex-col gap-4 p-6">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                        <h3 className="h4 mb-0">{business.name}</h3>
                        {business.businessType ? <span className="portfolio-role-pill">{business.businessType}</span> : null}
                      </div>
                      <p>{business.description}</p>
                      {business.websiteUrl ? <a href={business.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-brand mt-2 self-start">Visit Website</a> : null}
                    </div>
                  </article>
                ))}
              </div>
            </WorkGroup>
          ) : null}

          {presentation.showPhotography ? (
            <WorkGroup title="Photography" description="Collections, image-led stories, and visual highlights.">
              <div className={gridClassName}>
                {profile.photoProjects.map((project: PhotoProjectItem, index: number) => (
                  <article key={project.id} className={cardClassName} data-aos="fade-up" data-aos-delay={getStaggerDelay(index)}>
                    {project.imageUrl ? <img className="portfolio-media-image" src={project.imageUrl} alt={project.title} /> : null}
                    <div className="flex flex-col gap-4 p-6">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                        <h3 className="h4 mb-0">{project.title}</h3>
                        {project.collection ? <span className="portfolio-role-pill">{project.collection}</span> : null}
                      </div>
                      <p>{project.description}</p>
                      {project.projectUrl ? <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light mt-2 self-start">Open Collection</a> : null}
                    </div>
                  </article>
                ))}
              </div>
            </WorkGroup>
          ) : null}

          {presentation.showMotion ? (
            <WorkGroup title="3D / Motion" description="Image, GIF, and video-preview work for animation and 3D showcases.">
              <div className={gridClassName}>
                {profile.motionProjects.map((project: MotionProjectItem, index: number) => (
                  <article key={project.id} className={cardClassName} data-aos="fade-up" data-aos-delay={getStaggerDelay(index)}>
                    <MediaPreview
                      imageUrl={project.previewImageUrl}
                      gifUrl={project.previewGifUrl}
                      videoUrl={project.previewVideoUrl}
                      title={project.title}
                    />
                    <div className="flex flex-col gap-4 p-6">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                        <h3 className="h4 mb-0">{project.title}</h3>
                        {project.toolName ? <span className="portfolio-role-pill">{project.toolName}</span> : null}
                      </div>
                      <p>{project.description}</p>
                      {project.projectUrl ? <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn btn-brand mt-2 self-start">Open Piece</a> : null}
                    </div>
                  </article>
                ))}
              </div>
            </WorkGroup>
          ) : null}

          {presentation.showArtworks ? (
            <WorkGroup title="Artworks" description="Paintings, illustrations, and art-driven pieces with context.">
              <div className={gridClassName}>
                {profile.artworks.map((artwork: ArtworkItem, index: number) => (
                  <article key={artwork.id} className={cardClassName} data-aos="fade-up" data-aos-delay={getStaggerDelay(index)}>
                    {artwork.imageUrl ? <img className="portfolio-media-image" src={artwork.imageUrl} alt={artwork.title} /> : null}
                    <div className="flex flex-col gap-4 p-6">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                        <h3 className="h4 mb-0">{artwork.title}</h3>
                        {artwork.medium ? <span className="portfolio-role-pill">{artwork.medium}</span> : null}
                      </div>
                      <p>{artwork.description}</p>
                      {artwork.collectionUrl ? <a href={artwork.collectionUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light mt-2 self-start">Open Collection</a> : null}
                    </div>
                  </article>
                ))}
              </div>
            </WorkGroup>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="row pb-4" data-aos="fade-up">
      <div className="col-lg-8">
        <h6 className="mb-3 text-[0.88rem] font-extrabold uppercase tracking-[0.04em] text-brand">{eyebrow}</h6>
        <h1 className="mb-0 text-[2.15rem] font-extrabold leading-[1.08] sm:text-[2.75rem] lg:text-[3.15rem]">{title}</h1>
      </div>
    </div>
  );
}

function WorkGroup({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-brand fw-semibold mb-2">{title}</p>
        <p className="mb-0 text-white-50">{description}</p>
      </div>
      {children}
    </div>
  );
}

function MediaPreview({
  imageUrl,
  gifUrl,
  videoUrl,
  title,
}: {
  imageUrl: string | null;
  gifUrl: string | null;
  videoUrl: string | null;
  title: string;
}) {
  if (videoUrl) {
    return (
      <video className="portfolio-media-image" src={videoUrl} controls muted playsInline>
        Your browser does not support the video tag.
      </video>
    );
  }

  if (gifUrl) {
    return <img className="portfolio-media-image" src={gifUrl} alt={title} />;
  }

  if (imageUrl) {
    return <img className="portfolio-media-image" src={imageUrl} alt={title} />;
  }

  return <div className="portfolio-media-fallback">Preview coming soon</div>;
}

function ContactSection({ profile }: { profile: PortfolioData }) {
  return (
    <section id="contact" className="full-height portfolio-snap-section px-lg-5 px-4">
      <div className="container">
        <div className="flex justify-center text-center">
          <div className="w-full max-w-3xl pb-4" data-aos="fade-up">
            <h6 className="mb-3 text-[0.88rem] font-extrabold uppercase tracking-[0.04em] text-brand">
              {profile.contactInfo?.sectionLabel ?? "CONTACT"}
            </h6>
            <h1 className="mx-auto mb-0 text-[2.15rem] font-extrabold leading-[1.08] sm:text-[2.75rem] lg:text-[3.15rem]">
              {profile.contactInfo?.heading ?? "Interested in working together? Let's talk"}
            </h1>
            {profile.contactInfo?.description ? <p className="mt-3">{profile.contactInfo.description}</p> : null}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-3xl" data-aos="fade-up" data-aos-delay="300">
            <ContactForm profileId={profile.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioFooter({ profile }: { profile: PortfolioData }) {
  if (profile.socialLinks.length === 0) {
    return null;
  }

  return (
    <footer className="portfolio-footer px-4 py-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="portfolio-footer__inner">
          <div className="social-icons social-icons--compact">
            {profile.socialLinks.map((socialLink: SocialLinkItem) => (
              <a
                key={socialLink.id}
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={getSocialPlatformMeta(socialLink.platform).label}
                title={getSocialPlatformMeta(socialLink.platform).label}
              >
                <i className={getSocialPlatformMeta(socialLink.platform).iconClassName} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
