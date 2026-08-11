import { formatDate } from "@/lib/utils/dates";

export type GroupMeOpportunity = {
  title: string;
  company: string;
  deadline: string;
  url: string;
};

export function buildSingleOpportunityMessage(opportunity: GroupMeOpportunity): string {
  return [
    "📢 New Opportunity",
    `💼 ${opportunity.title} — ${opportunity.company}`,
    `📅 Deadline: ${formatDate(opportunity.deadline)}`,
    `🔗 ${opportunity.url}`,
    "Submit yours: nsbeutk.org/opportunities",
  ].join("\n");
}

export function buildDigestMessage(opportunities: GroupMeOpportunity[]): string {
  const blocks = opportunities
    .map(
      (opportunity) =>
        `💼 ${opportunity.title} — ${opportunity.company}\n📅 Deadline: ${formatDate(opportunity.deadline)}\n🔗 ${opportunity.url}`
    )
    .join("\n\n");

  return `📢 Opportunities Digest\n${blocks}\n\nView all: nsbeutk.org/opportunities`;
}
