export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  author: string;
  excerpt: string;
  body: string;
};

export const newsPosts: NewsPost[] = [
  {
    id: "regional-chapter-of-the-year",
    slug: "regional-chapter-of-the-year",
    title: "NSBE UTK Named Regional Chapter of the Year",
    publishedAt: "2026-05-10T00:00:00Z",
    author: "NSBE UTK PR Committee",
    excerpt: "Our chapter was recognized at the NSBE Regional Conference for outstanding programming and member engagement this year.",
    body: "Our chapter was recognized at the NSBE Regional Conference for outstanding programming and member engagement this year.\n\nThe award reflects a full year of GBMs, workshops, community service, and record attendance at the national convention. Thank you to every member and officer who made this possible.\n\nWe're already planning an even bigger year ahead — stay tuned to the Events page for what's next.",
  },
  {
    id: "fall-recruitment-kickoff",
    slug: "fall-recruitment-kickoff-recap",
    title: "Fall 2026 Recruitment Kickoff Recap",
    publishedAt: "2026-08-28T00:00:00Z",
    author: "NSBE UTK Programs Committee",
    excerpt: "Our Fall Kickoff GBM drew one of our largest first-meeting crowds yet — here's a recap.",
    body: "Our Fall Kickoff GBM drew one of our largest first-meeting crowds yet.\n\nNew and returning members heard from the executive board about this semester's programming, met committee chairs, and signed up for our email list.\n\nIf you missed it, check the Events page for the next GBM and the Join page to get involved.",
  },
  {
    id: "member-spotlight-nsf-grfp",
    slug: "member-spotlight-nsf-grfp",
    title: "Member Spotlight: Junior Wins NSF GRFP",
    publishedAt: "2026-09-15T00:00:00Z",
    author: "NSBE UTK PR Committee",
    excerpt: "One of our chapter members was awarded the NSF Graduate Research Fellowship — read about their path to the award.",
    body: "One of our chapter members was awarded the NSF Graduate Research Fellowship, one of the most competitive graduate funding awards in the country.\n\nThey credit chapter study halls and the Graduate School Resources on our site for helping them put together a strong application.\n\nSee the Opportunities page for the next round of fellowship deadlines.",
  },
  {
    id: "meridian-systems-partnership",
    slug: "meridian-systems-partnership",
    title: "New Partnership Announcement: Meridian Systems",
    publishedAt: "2026-09-22T00:00:00Z",
    author: "NSBE UTK Corporate Relations Committee",
    excerpt: "We're excited to welcome Meridian Systems as a Gold-tier corporate partner for the 2026–2027 school year.",
    body: "We're excited to welcome Meridian Systems as a Gold-tier corporate partner for the 2026–2027 school year.\n\nMeridian Systems will be sponsoring our fall recruiting events and funding two annual scholarships for chapter members.\n\nSee the Corporate Partners page for details on all of our current partners.",
  },
];
