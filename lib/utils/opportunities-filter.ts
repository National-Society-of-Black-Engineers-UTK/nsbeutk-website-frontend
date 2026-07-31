import type { Opportunity, OpportunityCategory } from "@/lib/data/opportunities";

export type OpportunityFilters = {
  category: OpportunityCategory | "All";
  query: string;
};

export function filterOpportunities(opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] {
  const query = filters.query.trim().toLowerCase();

  return opportunities.filter((opportunity) => {
    const matchesCategory = filters.category === "All" || opportunity.category === filters.category;
    if (!matchesCategory) return false;
    if (query.length === 0) return true;

    const haystack = `${opportunity.title} ${opportunity.company} ${opportunity.description}`.toLowerCase();
    return haystack.includes(query);
  });
}
