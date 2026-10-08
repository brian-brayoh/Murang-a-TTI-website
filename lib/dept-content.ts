// Department write-ups, taken from MTTI's published pages:
//   agriculture-department, business-department, offered-programmes (Building),
//   course-offered (Electrical), department-values (Hospitality),
//   our-programs (ICT), insight-from-the-hod-mechanical-department.
// Edit freely: these are plain text and appear on /courses/<id>.

export type Block = { heading: string; text?: string; items?: string[] };

export type DeptContent = {
  intro: string[];
  blocks: Block[];
  // Pull-quote style closing line from the old page
  closing?: string;
};

export const deptContent: Record<string, DeptContent> = {
  agriculture: {
    intro: [
      "Welcome to the Agriculture Department at Murang'a Technical Training Institute, a hub of excellence in agricultural education and innovation. The department equips trainees with the knowledge, skills and practical experience needed to transform the agricultural sector and promote sustainable development.",
      "The department offers courses and modular skill training taught by qualified staff, in response to changing technology, the job market and career needs.",
    ],
    blocks: [
      {
        heading: "How we train",
        items: [
          "Technology and theory in the classroom",
          "Practice on the institute's farm and units",
          "Research skills",
          "Hands-on practicum in an interactive environment",
        ],
      },
      {
        heading: "Our aim",
        text: "To shape each learner's destiny and be a change for the better, keeping abreast of changing technological trends in service to humanity.",
      },
    ],
    closing: "Courses and modular skills training. Ask admissions which programmes are open this intake.",
  },

  business: {
    intro: [
      "Business is one of the academic departments at Murang'a Technical Training Institute. It offers education and training in business-related disciplines and equips trainees with the knowledge and skills needed for careers in business, management, finance, marketing, entrepreneurship and related fields.",
    ],
    blocks: [
      {
        heading: "Curriculum",
        text: "Courses are updated to follow current industry trends. Subjects include:",
        items: ["Accounting", "Economics", "Business law", "Entrepreneurship", "Management", "Business ethics", "Information systems"],
      },
      {
        heading: "Skill development",
        text: "The department builds both soft and hard skills:",
        items: ["Communication", "Critical thinking", "Leadership", "Teamwork", "Analytical skills", "Decision-making"],
      },
      {
        heading: "Career preparation",
        items: [
          "Internships and industrial attachments",
          "Career fairs and workshops",
          "Business clubs and entrepreneurship activities",
          "Connections with industry for job placements",
        ],
      },
    ],
    closing:
      "The department plays a vital role in shaping future business leaders, entrepreneurs and professionals, mixing theory, practical experience and career development.",
  },

  building: {
    intro: [
      "The Building Department offers a learning experience that prepares trainees to excel in the construction industry. Join us and build your future with confidence.",
    ],
    blocks: [
      {
        heading: "Why choose us",
        items: [
          "Competent trainers: industry experts who teach both theory and hands-on skills",
          "Well-equipped workshops that meet industry standards",
          "A serene learning environment that fosters creativity and innovation",
          "Career-ready programmes tailored to market demand",
        ],
      },
    ],
    closing: "Shape your career with us, where excellence meets opportunity.",
  },

  electrical: {
    intro: [
      "The Electrical and Electronics Engineering Department is a hub of innovation, technical excellence and career-building. With modern facilities and a curriculum tailored to industry demand, it produces skilled professionals ready for the energy and technology sectors.",
    ],
    blocks: [
      {
        heading: "Cutting-edge training facilities",
        text: "Modern laboratories, advanced tools and simulation software give trainees practical, real-world learning.",
      },
      {
        heading: "Comprehensive curriculum",
        text: "Programmes blend theory with practice across:",
        items: [
          "Electrical power systems and transmission",
          "Electronics design and maintenance",
          "Automation and control systems",
          "Renewable energy systems: solar, wind and hydroelectric",
        ],
      },
      {
        heading: "Industry partnerships",
        text: "The department works with leading companies to provide industrial attachments, internships and job placement opportunities.",
      },
      {
        heading: "Experienced faculty",
        text: "Instructors are seasoned professionals with industry experience and a passion for mentoring the next generation of engineers.",
      },
    ],
    closing: "Join us today.",
  },

  hospitality: {
    intro: [
      "Vision: to provide a world-class hospitality experience that supports the learning and development of trainees and enhances the image of the institution.",
      "Mission: to deliver high-quality hospitality services that meet the needs of trainees, staff and visitors, fostering a conducive and welcoming environment for learning and professional growth.",
    ],
    blocks: [
      {
        heading: "Food and beverage",
        text: "Hands-on training that gives trainees relevant experience for the hospitality industry. Graduates can work as waiters, chefs, supervisors and managers in catering institutions, restaurants and hotels, or start their own catering businesses. The Food and Beverage Sales and Service courses teach the production and service of food and beverages, in theory and in practice.",
      },
      {
        heading: "Housekeeping and laundry",
        text: "Trainees are taken through several areas of housekeeping:",
        items: [
          "Cleaning and organisation",
          "Bathroom and kitchen maintenance",
          "Bed making with fresh linen",
          "Laundry assistance",
          "Air freshening and room care",
        ],
      },
      {
        heading: "Fashion design",
        text: "A wide, creative field covering clothing, accessories and more. We major in:",
        items: [
          "Footwear design: shoes, boots and sandals that balance looks with comfort",
          "Accessory design: bags, jewellery, scarves and hats",
        ],
      },
      {
        heading: "Hairdressing and beauty",
        items: [
          "Cutting techniques, basic and advanced",
          "Blow drying and curling",
          "Updos and braiding",
          "Men's haircuts and grooming",
        ],
      },
      {
        heading: "Our core values",
        items: [
          "Trainee: the needs and well-being of trainees come first",
          "Professionalism and courtesy in every interaction",
          "Quality service that exceeds expectations",
          "Efficiency in using resources",
          "Integrity: honesty, transparency and ethical behaviour",
          "Innovation to improve services and the trainee experience",
        ],
      },
    ],
  },

  ict: {
    intro: [
      "The ICT Department offers in-depth content in Information Communication Technology and Information Science, from theory to practical fundamentals: ICT for development, green technologies, research and innovation, to meet the growing need for ICT and information science personnel in all sectors.",
      "Information is an essential resource for organisations and society, and it plays a central part in education, research and development. The Diploma, Certificate and Artisan programmes in Information Technology take an interdisciplinary approach to training professionals with working competency across the economy.",
    ],
    blocks: [
      {
        heading: "Why study with us",
        text: "Graduates get real-world technological experience that prepares them for the fields of business and information technology, for the growth of the region and beyond.",
      },
      {
        heading: "Who it is for",
        text: "O-level graduates who want a career in the IT sector as:",
        items: [
          "Programmers and web developers",
          "Database designers and administrators",
          "Networking specialists",
          "Business managers and developers",
        ],
      },
    ],
    closing: "Join us for world-class training.",
  },

  mechanical: {
    intro: [
      "Welcome to the Department of Mechanical Engineering, where innovation meets excellence. The department is committed to top-notch technical education and to equipping trainees with the skills and knowledge to thrive in the engineering industry.",
      "Training facilities, modern equipment and a hands-on approach mean trainees gain practical experience and are prepared for real-world challenges, from advanced automotive systems to mechanical production.",
    ],
    blocks: [
      {
        heading: "Courses offered",
        items: [
          "Automotive Engineering (Level 6 and Level 5)",
          "Automotive Technician (Level 4)",
          "Mechanical Production Technician (Level 5 and Level 6)",
        ],
      },
    ],
    closing: "Take the first step towards a rewarding career in mechanical engineering.",
  },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The built-in write-up as editable HTML (what the admin editor starts from). */
export function deptDefaultHtml(id: string, blurb = ""): string {
  const c = deptContent[id];
  if (!c) return blurb ? `<p>${esc(blurb)}</p>` : "";
  const parts: string[] = c.intro.map((t) => `<p>${esc(t)}</p>`);
  for (const b of c.blocks) {
    parts.push(`<h2>${esc(b.heading)}</h2>`);
    if (b.text) parts.push(`<p>${esc(b.text)}</p>`);
    if (b.items) parts.push(`<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`);
  }
  if (c.closing) parts.push(`<p><strong>${esc(c.closing)}</strong></p>`);
  return parts.join("");
}
