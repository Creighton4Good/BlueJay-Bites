import React, {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { fetchCurrentUser, type User } from "@/lib/api";

type SessionContextValue = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    isOrganizer: boolean;
    isAdmin: boolean;
    refreshSession: () => Promise<User | null>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
    undefined
);

export function SessionProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = useCallback(async (): Promise<User | null> => {
        try {
            const currentUser = await fetchCurrentUser();
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            console.error("Error loading authenticated session:", error);
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        const loadInitialSession = async () => {
            setLoading(true);

            try {
                await refreshSession();
            } finally {
                setLoading(false);
            }
        };

        loadInitialSession();
    }, [refreshSession]);

    const value = useMemo<SessionContextValue>(
        () => ({
            user, 
            loading,
            isAuthenticated: user !== null,
            isOrganizer: user?.role.roleName === "event_organizer",
            isAdmin: user?.role.roleName === "admin",
            refreshSession,
        }),
        [user, loading, refreshSession]
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
            "useSession must be used inside a SessionProvider"
        );
    }

    return context;
}