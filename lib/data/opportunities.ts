export const OPPORTUNITY_CATEGORIES = [
  "Internship",
  "Full-Time",
  "Scholarship",
  "Research",
  "Hackathon",
  "Conference",
  "Graduate School",
  "Leadership",
  "Volunteer",
  "Career Fair",
  "Study Session",
] as const;

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export type Opportunity = {
  id: string;
  title: string;
  company: string;
  category: OpportunityCategory;
  deadline: string;
  eligibility: string;
  description: string;
  url: string;
};

export const opportunities: Opportunity[] = [
  {
    id: "meridian-swe-intern",
    title: "Software Engineering Intern",
    company: "Meridian Systems",
    category: "Internship",
    deadline: "2026-09-15T00:00:00Z",
    eligibility: "Sophomore or above, any engineering or CS major",
    description: "Summer 2027 internship on Meridian's platform engineering team. Housing stipend included.",
    url: "https://example.com",
  },
  {
    id: "nsbe-convention-travel-scholarship",
    title: "NSBE National Convention Travel Scholarship",
    company: "NSBE National",
    category: "Scholarship",
    deadline: "2026-10-01T00:00:00Z",
    eligibility: "Active NSBE national members in good standing",
    description: "Covers flight and registration costs for members attending the NSBE National Convention.",
    url: "https://example.com",
  },
  {
    id: "sure-research-fellowship",
    title: "Summer Undergraduate Research Fellowship",
    company: "UTK College of Engineering",
    category: "Research",
    deadline: "2026-11-01T00:00:00Z",
    eligibility: "Junior or senior standing, 3.0 GPA or above",
    description: "A paid ten-week summer research fellowship working directly with a UTK Engineering faculty mentor.",
    url: "https://example.com",
  },
  {
    id: "hackknox-hackathon",
    title: "HackKnox Hackathon",
    company: "HackKnox Organizing Committee",
    category: "Hackathon",
    deadline: "2026-09-25T00:00:00Z",
    eligibility: "Open to all currently enrolled UTK students",
    description: "A 24-hour student hackathon with prizes for best overall hack and best use of open data.",
    url: "https://example.com",
  },
  {
    id: "gem-fellowship",
    title: "GEM Fellowship",
    company: "The GEM Consortium",
    category: "Graduate School",
    deadline: "2026-11-15T00:00:00Z",
    eligibility: "Seniors planning to pursue an MS or PhD in engineering or science",
    description: "Full funding for graduate study plus a paid summer internship with a GEM member employer.",
    url: "https://example.com",
  },
  {
    id: "chapter-programs-committee-lead",
    title: "Programs Committee Lead",
    company: "NSBE UTK",
    category: "Leadership",
    deadline: "2026-09-05T00:00:00Z",
    eligibility: "Active chapter members, any year",
    description: "Help plan GBMs, workshops, and socials for the spring semester as a Programs Committee lead.",
    url: "https://example.com",
  },
  {
    id: "habitat-volunteer-crew",
    title: "Habitat for Humanity Volunteer Crew",
    company: "Knoxville Habitat for Humanity",
    category: "Volunteer",
    deadline: "2026-09-18T00:00:00Z",
    eligibility: "Open to all members; closed-toe shoes required",
    description: "Join the chapter build crew for a morning on-site with Knoxville Habitat for Humanity.",
    url: "https://example.com",
  },
  {
    id: "fall-engineering-career-fair",
    title: "Fall Engineering Career Fair",
    company: "UTK Engineering Career Services",
    category: "Career Fair",
    deadline: "2026-10-05T00:00:00Z",
    eligibility: "Open to all UTK Engineering students",
    description: "Meet recruiters from over 100 companies at the college-wide fall career fair.",
    url: "https://example.com",
  },
  {
    id: "circuits-study-session",
    title: "Circuits Study Session",
    company: "NSBE UTK Academic Excellence Committee",
    category: "Study Session",
    deadline: "2026-09-30T00:00:00Z",
    eligibility: "Open to any member currently enrolled in a circuits course",
    description: "A peer-led review session ahead of the ECE 302 midterm, hosted by upperclassmen members.",
    url: "https://example.com",
  },
  {
    id: "highland-manufacturing-engineer",
    title: "Manufacturing Engineer (Full-Time)",
    company: "Highland Robotics",
    category: "Full-Time",
    deadline: "2026-12-01T00:00:00Z",
    eligibility: "Graduating seniors, Mechanical or Industrial Engineering",
    description: "Entry-level manufacturing engineering role on Highland Robotics' production line team.",
    url: "https://example.com",
  },
  {
    id: "nsf-grfp",
    title: "NSF Graduate Research Fellowship Program",
    company: "National Science Foundation",
    category: "Graduate School",
    deadline: "2026-10-20T00:00:00Z",
    eligibility: "Seniors or first-year graduate students in an NSF-supported field",
    description: "A five-year fellowship including three years of financial support for graduate study.",
    url: "https://example.com",
  },
];
