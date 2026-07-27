import React, { type ReactNode } from "react";
import { useSession } from "@/app/contexts/session-context";
import { Redirect } from "expo-router";

type OrganizerRouteGuardProps = {
    children: ReactNode;
};

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