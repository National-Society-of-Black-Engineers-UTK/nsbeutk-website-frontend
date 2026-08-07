import { setMemberRole } from "@/lib/actions/officer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/auth/profile";

export function OfficerRoster({
  roster,
  currentProfileId,
}: {
  roster: Profile[];
  currentProfileId: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th className="px-4 py-3 font-bold">Name</th>
            <th className="px-4 py-3 font-bold">Email</th>
            <th className="px-4 py-3 font-bold">Role</th>
            <th className="px-4 py-3 font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((member, index) => (
            <tr key={member.id} className={index % 2 === 1 ? "bg-fill-subtle" : "bg-surface"}>
              <td className="px-4 py-3">{member.fullName ?? "—"}</td>
              <td className="px-4 py-3">{member.email}</td>
              <td className="px-4 py-3">
                <Badge variant={member.role === "officer" ? "primary" : "secondary"}>
                  {member.role}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <form action={setMemberRole}>
                  <input type="hidden" name="profileId" value={member.id} />
                  <input
                    type="hidden"
                    name="role"
                    value={member.role === "officer" ? "member" : "officer"}
                  />
                  <Button type="submit" variant="secondary" className="min-h-9 px-4 py-2 text-xs">
                    {member.role === "officer" ? "Demote" : "Promote"}
                    {member.id === currentProfileId ? " (you)" : ""}
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
