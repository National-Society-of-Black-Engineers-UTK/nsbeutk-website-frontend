"use client";

import * as React from "react";
import { OPPORTUNITY_CATEGORIES, type Opportunity } from "@/lib/data/opportunities";
import { filterOpportunities } from "@/lib/utils/opportunities-filter";
import { Input } from "@/components/ui/input";
import { OpportunityCard } from "./opportunity-card";

export function OpportunitiesBrowser({ opportunities }: { opportunities: Opportunity[] }) {
  const [category, setCategory] = React.useState<"All" | Opportunity["category"]>("All");
  const [query, setQuery] = React.useState("");

  const results = filterOpportunities(opportunities, { category, query });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="opportunities-search" className="text-sm font-bold text-foreground">
            Search
          </label>
          <Input
            id="opportunities-search"
            type="search"
            placeholder="Search by title or company"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:w-64">
          <label htmlFor="opportunities-category" className="text-sm font-bold text-foreground">
            Category
          </label>
          <select
            id="opportunities-category"
            className="min-h-11 rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            value={category}
            onChange={(event) => setCategory(event.target.value as "All" | Opportunity["category"])}
          >
            <option value="All">All categories</option>
            {OPPORTUNITY_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-caption">No opportunities match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      )}
    </div>
  );
}
