import React, { type ReactNode } from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

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

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#00235D",
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        fontSize: 16,
        lineHeight: 22,
        color: "#555",
        textAlign: "center",
    },
});