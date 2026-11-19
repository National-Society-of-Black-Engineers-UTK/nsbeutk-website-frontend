export const SPONSOR_TIERS = ["Gold", "Silver", "Bronze"] as const;

export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export type Sponsor = {
  id: string;
  name: string;
  tier: SponsorTier;
  website: string;
  description: string;
};
