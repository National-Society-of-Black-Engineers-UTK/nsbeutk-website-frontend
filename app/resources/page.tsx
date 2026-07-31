import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Resources",
  description: "Chapter documents: constitution, bylaws, resume templates, and more.",
};

type ResourceFile = {
  name: string;
  updatedAt: string;
  sizeLabel: string;
};

const RESOURCE_FOLDERS: { name: string; files: ResourceFile[] }[] = [
  {
    name: "General Members",
    files: [
      { name: "NSBE UTK Constitution.pdf", updatedAt: "August 2026", sizeLabel: "412 KB" },
      { name: "NSBE UTK Bylaws.pdf", updatedAt: "August 2026", sizeLabel: "298 KB" },
      { name: "Member Handbook.pdf", updatedAt: "August 2026", sizeLabel: "1.1 MB" },
    ],
  },
  {
    name: "Professional Development",
    files: [
      { name: "Resume Template.docx", updatedAt: "July 2026", sizeLabel: "54 KB" },
      { name: "Interview Prep Guide.pdf", updatedAt: "July 2026", sizeLabel: "680 KB" },
      { name: "LinkedIn Optimization Guide.pdf", updatedAt: "July 2026", sizeLabel: "520 KB" },
    ],
  },
  {
    name: "Conference",
    files: [
      { name: "National Convention Guide.pdf", updatedAt: "June 2026", sizeLabel: "890 KB" },
      { name: "Travel Reimbursement Form.pdf", updatedAt: "June 2026", sizeLabel: "210 KB" },
      { name: "Conference Funding Application.pdf", updatedAt: "June 2026", sizeLabel: "180 KB" },
    ],
  },
  {
    name: "Officer Resources",
    files: [
      { name: "Officer Transition Guide.pdf", updatedAt: "May 2026", sizeLabel: "1.4 MB" },
      { name: "Meeting Minutes Template.docx", updatedAt: "May 2026", sizeLabel: "38 KB" },
      { name: "Chapter Budget Template.xlsx", updatedAt: "May 2026", sizeLabel: "62 KB" },
    ],
  },
  {
    name: "Sponsors",
    files: [
      { name: "Partnership Packet.pdf", updatedAt: "July 2026", sizeLabel: "2.2 MB" },
      { name: "Sponsor One-Pager.pdf", updatedAt: "July 2026", sizeLabel: "410 KB" },
      { name: "Chapter Logo Assets.zip", updatedAt: "July 2026", sizeLabel: "3.8 MB" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Resources</h1>
        <p className="mt-4 text-base text-foreground">
          Chapter documents, organized the same way they&apos;re stored in Microsoft Teams. In a
          later phase these will pull live from SharePoint via Microsoft Graph — for now, sample
          files below show the structure.
        </p>
      </section>

      <Accordion type="multiple" className="max-w-3xl">
        {RESOURCE_FOLDERS.map((folder) => (
          <AccordionItem key={folder.name} value={folder.name}>
            <AccordionTrigger>{folder.name}</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-3">
                {folder.files.map((file) => (
                  <li key={file.name} className="flex items-center justify-between gap-4 rounded-md bg-primary/5 px-4 py-3">
                    <span className="flex items-center gap-3 text-sm text-foreground">
                      <FileText className="size-4 shrink-0 text-primary dark:text-secondary" aria-hidden="true" />
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-caption">
                      {file.updatedAt} · {file.sizeLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
