import type { NsbeEvent } from "./events";
import type { NewsPost } from "./news";
import type { Officer } from "./officers";
import type { Sponsor } from "./sponsors";

type ChapterLink = { label: string; href: string };

type ChapterContent = {
  officers: Officer[];
  sponsors: Sponsor[];
  events: NsbeEvent[];
  newsPosts: NewsPost[];
  spotlightSlug?: string;
  committees: string[];
  stats: { label: string; value: number }[];
  contacts: { role: string; email: string }[];
  email?: string;
  socials: ChapterLink[];
  joinLink?: ChapterLink;
  sponsorshipEmail?: string;
  partnershipPacketUrl?: string;
  galleryLink?: ChapterLink;
  resources: ChapterLink[];
};

// Add chapter-approved public content here. Empty sections and absent links stay hidden.
export const chapter: ChapterContent = {
  officers: [],
  sponsors: [],
  events: [],
  newsPosts: [],
  committees: [],
  stats: [],
  contacts: [],
  socials: [],
  resources: [],
};
