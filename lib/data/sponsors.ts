export const SPONSOR_TIERS = ["Gold", "Silver", "Bronze"] as const;

export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export type Sponsor = {
  id: string;
  name: string;
  tier: SponsorTier;
  website: string;
  description: string;
};

export const sponsors: Sponsor[] = [
  {
    id: "meridian-systems",
    name: "Meridian Systems",
    tier: "Gold",
    website: "https://example.com",
    description: "Meridian Systems sponsors our fall recruiting events and funds two annual scholarships for chapter members.",
  },
  {
    id: "highland-robotics",
    name: "Highland Robotics",
    tier: "Gold",
    website: "https://example.com",
    description: "Highland Robotics hosts our spring plant tour and regularly hires chapter members as summer interns.",
  },
  {
    id: "bluepeak-energy",
    name: "Bluepeak Energy",
    tier: "Silver",
    website: "https://example.com",
    description: "Bluepeak Energy supports our professional development workshop series.",
  },
  {
    id: "cumberland-analytics",
    name: "Cumberland Analytics",
    tier: "Silver",
    website: "https://example.com",
    description: "Cumberland Analytics sends engineers to our resume review nights each semester.",
  },
  {
    id: "volunteer-ridge-foods",
    name: "Volunteer Ridge Foods",
    tier: "Bronze",
    website: "https://example.com",
    description: "Volunteer Ridge Foods provides catering for our GBMs throughout the year.",
  },
  {
    id: "foothills-manufacturing",
    name: "Foothills Manufacturing Co.",
    tier: "Bronze",
    website: "https://example.com",
    description: "Foothills Manufacturing Co. is a longtime supporter of our chapter's community service events.",
  },
];
