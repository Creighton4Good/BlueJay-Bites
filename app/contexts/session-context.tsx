import React, {
    createContext,
    type ReactNode,
    useContext,
    useMemo,
} from "react";

import type { User } from "@/lib/api";

// Protoype-only. This will eventually come from the authenticated session.
const PROTOTYPE_CURRENT_USER_ID = Number(
    process.env.EXPO_PUBLIC_TEST_USER_ID ?? 1
);

type SessionContextValue = {
    user: User;
    isOrganizer: boolean;
    isAdmin: boolean;
};

const prototypeUsers: Record<number, User> = {
    1: {
        id: 1,
        email: "testorganizer@example.com",
        displayName: "Test Organizer",
        authProvider: "local",
        role: {
            id: 2,
            roleName: "event_organizer",
            description: "Can create and manage their own food events",
        },
    },

    2: {
        id: 2,
        email: "testuser@example.com",
        displayName: "Test User",
        authProvider: "local",
        role: {
            id: 1,
            roleName: "user",
            description: "Regular user who can view food events",
        },
    },

    3: {
        id: 3,
        email: "testorganizer2@example.com",
        displayName: "Second Test Organizer",
        authProvider: "local",
        role: {
            id: 2, 
            roleName: "event_organizer",
            description: "Can create and manage their own food events",
        },
    },
};

const SessionContext = createContext<SessionContextValue | undefined>(
    undefined
);

export function SessionProvider({
    children,
}: {
    children: ReactNode;
}) {
    const user = 
        prototypeUsers[PROTOTYPE_CURRENT_USER_ID] ?? prototypeUsers[2];

    const value = useMemo(
        () => ({
            user, 
            isOrganizer: user.role.roleName === "event_organizer",
            isAdmin: user.role.roleName === "admin",
        }),
        [user]
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error(
            "useSession must be used inside a Sessionprovider"
        );
    }

    return context;
}