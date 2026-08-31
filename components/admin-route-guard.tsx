import React, { type ReactNode } from "react";
import { useSession } from "@/app/contexts/session-context";
import { Redirect } from "expo-router";

type AdminRouteGuardProps = {
    children: ReactNode;
};

/**
 * Frontend route guard for admin-only screens.
 * 
 * If the current user is not an admin, they are redirected to the main app
 * route instead of seeing the wrapped screen.
 * 
 * This guard controls frontend navigation only. Backend endpoints used by
 * admin screens must still enforce admin authorization independently.
 */
export function AdminRouteGuard({
    children,
}: AdminRouteGuardProps) {
    const { isAdmin } = useSession();

    // Unlike OrganizerRouteGuard, organizer access alone is not sufficient here.
    if (!isAdmin) {
        return <Redirect href="/" />;
    }

    return <>{children}</>;
}
