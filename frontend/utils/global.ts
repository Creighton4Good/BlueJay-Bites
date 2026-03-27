/**
 * Global User Role Management
 * 
 * Simple global state for storing the current user's role.
 * Used to determine which tabs are visible in the navigation.
 * 
 * Roles:
 * - "consumer": View-only access (home, map, settings tabs)
 * - "creator": Can create events (all tabs including "add")
 * - "admin": Full access to all features (all tabs)
 * 
 * Note: This is a simplified role system without actual authentication.
 * In production, roles should be managed with proper auth and secure storage.
 */

// Global variable storing the current user's role
export let userRole: string = "";

/**
 * Sets the user role
 * Called from the login screen when a user selects their role
 */
export function setUserRole(role: string) {
  userRole = role;
}

/**
 * Gets the current user role
 * Used by the tab navigation to determine which tabs to show
 */
export function getUserRole() {
  return userRole;
}