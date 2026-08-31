import React, {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { fetchCurrentUser, LOGOUT_URL, type User } from "@/lib/api";

/**
 * Shared authentication/session state for the frontend.
 * 
 * `SessionProvicer` is mounted near the root of the app so screens can access
 * the authenticated user through `useSession()`.
 * 
 * Authentication is handled by the Spring Boot backend and Microsoft Entra.
 * The frontend does not store credentials or tokens directly. Instead,
 * `fetchCurrentUser()` calls `api/users/me` to determine which user is
 * associated with the current backend session.
 */
type SessionContextValue = {
    user: User | null;

    // True while the app is checking whether an authenticated session exists.
    loading: boolean;

    // Convenience values derived from the current authenticated user.
    isAuthenticated: boolean;
    isOrganizer: boolean;
    isAdmin: boolean;

    // Re-fetch the current user from the backend and update SessionContext.
    refreshSession: () => Promise<User | null>;
    signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
    undefined
);

export function SessionProvider({
    children,
}: {
    children: ReactNode;
}) {
    /*
        `user === null` can mean either:
        - the user is signed out, or
        - the initial session check has not finished yet.

        Consumers should use `loading` when they need to distinguish between
        those states.
    */
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /*
        Ask the backend for the user associated with the current session.

        This is used after sign-in and after account changes so the frontend
        reflects the latest database-backed user information.
    */
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

    const signOut = useCallback(async () => {
        if (typeof window !== "undefined") {
            window.location.href = LOGOUT_URL;
            return;
        }
        
        setUser(null);
    }, []);

    /*
        Check for an existing authenticated session when the app first loads.

        The root layout uses `loading` and `isAuthenticated` to decide whether
        authenticated routes or the sign-in screen should be shown.
    */
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

    /*
        Derive commonly used authentication and role flags from the current user.

        These flags are useful for frontend navigation and visibility. Backend
        authorization remains the source of truth for protected API operations.
    */
    const value = useMemo<SessionContextValue>(
        () => ({
            user, 
            loading,
            isAuthenticated: user !== null,
            isOrganizer: user?.role.roleName === "event_organizer",
            isAdmin: user?.role.roleName === "admin",
            refreshSession,
            signOut,
        }),
        [user, loading, refreshSession, signOut]
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

/*
    Convenience hook for accessing SessionContext.

    Throwing here makes it obvious when a component is accidentally rendered
    outside the `SessionProvider`.
*/
export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error(
            "useSession must be used inside a SessionProvider"
        );
    }

    return context;
}