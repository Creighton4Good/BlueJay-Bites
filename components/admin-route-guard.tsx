import React, { type ReactNode } from "react";
import { useSession } from "@/app/contexts/session-context";
import { Redirect } from "expo-router";

type AdminRouteGuardProps = {
    children: ReactNode;
};

export function AdminRouteGuard({
    children,
}: AdminRouteGuardProps) {
    const { isAdmin } = useSession();

    // Admin-only: unlike the organizer guard, this does NOT allow organizers.
    // Only users with the admin role may access the wrapped screen.
    if (!isAdmin) {
        return <Redirect href="/" />;
    }

    return <>{children}</>;
}
