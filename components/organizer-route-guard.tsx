import React, { type ReactNode } from "react";
import { useSession } from "@/app/contexts/session-context";
import { Redirect } from "expo-router";

type OrganizerRouteGuardProps = {
    children: ReactNode;
};

/**
 * Frontend route guard for organizer-level screens.
 * 
 * Access is allowed to:
 * - event organizers
 * - admins
 * 
 * Users without either role are redirected to the main app route.
 * 
 * This guard controls frontend navigation only. Backend endpoints used by
 * organizer/admin screens must still enforce authorization independently.
 */
export function OrganizerRouteGuard({
    children,
}: OrganizerRouteGuardProps) {
    const { isOrganizer, isAdmin } = useSession();

    const canAccess = isOrganizer || isAdmin;

    if (!canAccess) {
        return <Redirect href="/" />;
    }

    return <>{children}</>;
}