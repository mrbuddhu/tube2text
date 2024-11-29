'use client';

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

export function ClerkSignInButton() {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {user.firstName || user.emailAddresses[0].emailAddress}
        </span>
        <SignOutButton>
          <Button variant="ghost" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <Button variant="ghost" size="sm" className="gap-2">
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    </SignInButton>
  );
}
