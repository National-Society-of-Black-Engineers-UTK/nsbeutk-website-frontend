import { approveOpportunity, rejectOpportunity } from "@/lib/actions/opportunities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/dates";

type PendingOpportunity = {
  id: string;
  title: string;
  company: string;
  category: string;
  deadline: string;
  description: string;
  eligibility: string;
  url: string;
  submitted_by_name: string;
  submitted_by_email: string;
};

export function PendingOpportunities({ opportunities }: { opportunities: PendingOpportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-caption">No opportunities are waiting for review.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {opportunities.map((opportunity) => (
        <Card key={opportunity.id} className="flex flex-col gap-2 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{opportunity.category}</Badge>
            <h3 className="text-lg font-bold text-primary dark:text-secondary">{opportunity.title}</h3>
          </div>
          <p className="text-sm font-medium text-foreground">{opportunity.company}</p>
          <p className="text-sm text-caption">Deadline: {formatDate(opportunity.deadline)}</p>
          <p className="text-sm text-caption">
            Submitted by {opportunity.submitted_by_name} ({opportunity.submitted_by_email})
          </p>
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">{opportunity.description}</p>
          <p className="break-words text-sm text-foreground">Eligibility: {opportunity.eligibility}</p>
          <p className="break-all text-sm text-foreground">
            Destination URL:{" "}
            {/^https?:\/\//i.test(opportunity.url) ? (
              <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="underline">
                {opportunity.url}
              </a>
            ) : opportunity.url}
          </p>
          <div className="mt-2 flex gap-3">
            <form action={approveOpportunity}>
              <input type="hidden" name="id" value={opportunity.id} />
              <Button type="submit" className="min-h-9 px-4 py-2 text-xs">
                Approve
              </Button>
            </form>
            <form action={rejectOpportunity}>
              <input type="hidden" name="id" value={opportunity.id} />
              <Button type="submit" variant="secondary" className="min-h-9 px-4 py-2 text-xs">
                Reject
              </Button>
            </form>
          </div>
        </Card>
      ))}
    </div>
  );
}
