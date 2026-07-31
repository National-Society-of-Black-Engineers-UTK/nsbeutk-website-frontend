export type Officer = {
  id: string;
  name: string;
  role: string;
  major: string;
  year: string;
};

export const officers: Officer[] = [
  { id: "president", name: "Jordan Williams", role: "President", major: "Electrical Engineering", year: "Senior" },
  { id: "vice-president", name: "Amara Chen", role: "Vice President", major: "Computer Science", year: "Senior" },
  { id: "treasurer", name: "Malik Johnson", role: "Treasurer", major: "Mechanical Engineering", year: "Junior" },
  { id: "secretary", name: "Simone Carter", role: "Secretary", major: "Chemical Engineering", year: "Junior" },
  { id: "programs-chair", name: "Devon Brooks", role: "Programs Chair", major: "Biomedical Engineering", year: "Senior" },
  { id: "corporate-relations-chair", name: "Nia Robinson", role: "Corporate Relations Chair", major: "Industrial Engineering", year: "Junior" },
  { id: "pr-historian-chair", name: "Elijah Turner", role: "PR & Historian Chair", major: "Computer Engineering", year: "Sophomore" },
];
