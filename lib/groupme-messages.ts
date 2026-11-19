import { formatDate } from "@/lib/utils/dates";

export type GroupMeOpportunity = {
  title: string;
  company: string;
  deadline: string;
  url: string;
};

export function buildSingleOpportunityMessage(opportunity: GroupMeOpportunity): string {
  const message = [
    "📢 New Opportunity",
    `💼 ${opportunity.title} — ${opportunity.company}`,
    `📅 Deadline: ${formatDate(opportunity.deadline)}`,
    `🔗 ${opportunity.url}`,
    "Submit yours: nsbeutk.org/opportunities",
  ].join("\n");
  return message.length <= 1000
    ? message
    : `📢 New Opportunity\n💼 ${opportunity.title} — ${opportunity.company}\n📅 Deadline: ${formatDate(opportunity.deadline)}\nView details: nsbeutk.org/opportunities`;
}

export function buildDigestMessage(opportunities: GroupMeOpportunity[]): string {
  const blocks = opportunities
    .map(
      (opportunity) =>
        `💼 ${opportunity.title} — ${opportunity.company}\n📅 Deadline: ${formatDate(opportunity.deadline)}\n🔗 ${opportunity.url}`
    )
    .join("\n\n");

  const message = `📢 Opportunities Digest\n${blocks}\n\nView all: nsbeutk.org/opportunities`;
  return message.length <= 1000
    ? message
    : `📢 Opportunities Digest\n${opportunities.length} opportunities to explore.\nView all: nsbeutk.org/opportunities`;
}
