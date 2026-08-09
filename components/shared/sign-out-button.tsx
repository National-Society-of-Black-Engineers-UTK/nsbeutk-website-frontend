import { signOut } from "@/lib/actions/auth";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SignOutButton({ variant = "secondary" }: { variant?: ButtonProps["variant"] }) {
  return (
    <form action={signOut}>
      <Button type="submit" variant={variant}>
        Log out
      </Button>
    </form>
  );
}
