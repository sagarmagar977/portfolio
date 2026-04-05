import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set for seeding.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.socialLink.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.artwork.deleteMany();
  await prisma.motionProject.deleteMany();
  await prisma.photoProject.deleteMany();
  await prisma.business.deleteMany();
  await prisma.education.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.project.deleteMany();
  await prisma.service.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.adminUser.deleteMany();

  const adminUser = await prisma.adminUser.create({
    data: {
      email: "sagar@gmail.com",
      passwordHash:
        "scrypt:32768:8:1$seed-default-salt$e896149a816b19bf6f70765fa8f95e1ea164d5be3a094e93a8b3101907ecd410bcbc8d33035816e205e2500131e920130a8267b27302e674d9946b6a74a6a69f",
    },
  });

  const profile = await prisma.profile.create({
    data: {
      adminUserId: adminUser.id,
      slug: "sagar-thapa",
      templateKey: "classic",
      roles: ["developer", "beatmaker", "business"],
      fullName: "Sagar Thapa",
      heroTitlePrefix: "I'M A",
      heroHighlight: "DJANGO DEVELOPER",
      heroTitleSuffix: "FROM KATHMANDU, NEPAL",
      heroDescription:
        "I am Sagar Thapa, an IT and Music enthusiast who creates engaging and effective solutions.",
      location: "Kathmandu, Nepal",
      profileImageUrl: "/assets/images/person.jpg",
      cvFileUrl: "/assets/cv/Sagar-Thapa's-CV.pdf",
      aboutSectionTitle: "My Education & Experience",
    },
  });

  await prisma.contactInfo.create({
    data: {
      profileId: profile.id,
      sectionLabel: "CONTACT",
      heading: "Interested in working together? Let's talk",
      description: null,
      phone: "+977-9804458369",
      email: null,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        profileId: profile.id,
        title: "Backend Development",
        description:
          "I build robust and scalable server-side solutions using Django REST Framework. From creating APIs to managing databases, I ensure seamless functionality and performance.",
        iconName: "las la-server",
        sortOrder: 1,
      },
      {
        profileId: profile.id,
        title: "Full-Stack web development",
        description:
          "Combining backend expertise with frontend design, I deliver complete web solutions using Django and Bootstrap. I focus on creating responsive and user-friendly websites tailored to your needs.",
        iconName: "las la-laptop-code",
        sortOrder: 2,
      },
      {
        profileId: profile.id,
        title: "Music Production",
        description:
          "Using FL Studio, I make high-quality music tracks and beats. Whether it's for personal projects or professional needs, I provide creative and polished audio productions.",
        iconName: "las la-music",
        sortOrder: 3,
      },
    ],
  });

  await prisma.project.createMany({
    data: [
      {
        profileId: profile.id,
        title: "Kaam",
        description:
          "Made a responsive Nepali To-Do web app using Django and Bootstrap.",
        imageUrl: "/assets/images/kaam.JPG",
        liveUrl: "https://kaam.onrender.com/",
        sortOrder: 1,
      },
      {
        profileId: profile.id,
        title: "BlogVerse",
        description:
          "Made using Django and Bootstrap5 where a user can create Blog Post.",
        imageUrl: "/assets/images/project_blogverse.JPG",
        liveUrl: null,
        sortOrder: 2,
      },
      {
        profileId: profile.id,
        title: "Startup Landing Page: Afnai Bank",
        description:
          "Landing page for a Startup Company made using Bootstrap5.",
        imageUrl: "/assets/images/project2.JPG",
        liveUrl: "https://sagarmagar977.github.io/afnai_Bank/",
        sortOrder: 3,
      },
    ],
  });

  await prisma.beat.createMany({
    data: [
      {
        profileId: profile.id,
        title: "My Latest Beat (High Waves)",
        description: "Beat is in C minor scale and is of 75 BPM.",
        coverImageUrl: "/assets/beats/beat1.JPG",
        audioUrl: "/assets/beats/beat1.mp3",
        externalUrl: "https://soundcloud.com/",
        sortOrder: 1,
      },
      {
        profileId: profile.id,
        title: "Beat : Late Nights",
        description: "Beat is in C# minor scale and is of 130 BPM.",
        coverImageUrl: "/assets/beats/beat2.JPG",
        audioUrl: "/assets/beats/beat2.mp3",
        externalUrl: "https://www.youtube.com/",
        sortOrder: 2,
      },
    ],
  });

  await prisma.business.create({
    data: {
      profileId: profile.id,
      name: "Combined Tech Studio",
      businessType: "Creative Technology Venture",
      description:
        "A hybrid studio bringing together custom software builds, music production support, and brand-first digital experiences.",
      websiteUrl: "https://example.com/",
      imageUrl: "/assets/images/project-4.png",
      sortOrder: 1,
    },
  });

  await prisma.education.createMany({
    data: [
      {
        profileId: profile.id,
        degree: "Master of Computer Applications",
        institution: "Kantipur City College",
        period: "2024 - still running",
        sortOrder: 1,
      },
      {
        profileId: profile.id,
        degree: "Post Graduate Diploma in Computer Application",
        institution: "Kantipur City College",
        period: "2022 - 2023",
        sortOrder: 2,
      },
      {
        profileId: profile.id,
        degree: "Bachelor of Science",
        institution: "Sardar Patel University",
        period: "2018 - 2021",
        sortOrder: 3,
      },
    ],
  });

  await prisma.experience.createMany({
    data: [
      {
        profileId: profile.id,
        role: "Science and Math teacher",
        company: "Arunodaya Secondary School",
        period: "2021 - 2023",
        sortOrder: 1,
      },
      {
        profileId: profile.id,
        role: "Math and English Instructor",
        company: "Ex-Army Fitness Traning Center",
        period: "2021 - 2022",
        sortOrder: 2,
      },
      {
        profileId: profile.id,
        role: "Science and Math Teacher",
        company: "Balshaikshanki Secondary School",
        period: "2015 - 2017",
        sortOrder: 3,
      },
    ],
  });

  await prisma.socialLink.createMany({
    data: [
      {
        profileId: profile.id,
        platform: "linkedin",
        url: "https://www.linkedin.com/in/sagar-og-magar-656756210/",
        sortOrder: 1,
      },
      {
        profileId: profile.id,
        platform: "github",
        url: "https://github.com/sagarmagar977",
        sortOrder: 2,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
