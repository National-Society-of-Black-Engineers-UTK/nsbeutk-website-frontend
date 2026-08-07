import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type ComingSoonCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function ComingSoonCard({ icon: Icon, title, description }: ComingSoonCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-6">
      <Icon className="size-6 text-secondary" aria-hidden="true" />
      <h2 className="text-lg font-bold text-primary dark:text-secondary">{title}</h2>
      <p className="text-sm text-foreground">{description}</p>
      <span className="mt-auto inline-flex w-fit rounded bg-secondary/20 px-2 py-1 text-xs font-bold text-primary dark:text-secondary">
        Coming in a later phase
      </span>
    </Card>
  );
}
