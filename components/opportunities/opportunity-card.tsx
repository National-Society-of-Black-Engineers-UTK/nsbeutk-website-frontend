import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, isDeadlineSoon } from "@/lib/utils/dates";
import type { Opportunity } from "@/lib/data/opportunities";
import { cn } from "@/lib/utils";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const deadlineSoon = isDeadlineSoon(opportunity.deadline);

  return (
    <Card className="flex flex-col gap-3 border-l-4 border-l-secondary p-6">
      <Badge variant="primary">{opportunity.category}</Badge>
      <h3 className="text-lg font-bold text-primary dark:text-secondary">{opportunity.title}</h3>
      <p className="text-sm font-medium text-foreground">{opportunity.company}</p>
      <p className={cn("text-sm font-medium", deadlineSoon ? "text-red-600 dark:text-red-400" : "text-caption")}>
        Deadline: {formatDate(opportunity.deadline)}
      </p>
      <p className="text-sm text-caption">Eligibility: {opportunity.eligibility}</p>
      <p className="text-sm text-foreground">{opportunity.description}</p>
      <a
        href={opportunity.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary"
      >
        Apply / Learn more
      </a>
    </Card>
  );
}
