import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Platform,
    ScrollView, Alert, Button, KeyboardAvoidingView,
} from 'react-native';
import {
    assignAdmin,
    assignOrganizer,
    assignUser,
    fetchRoles,
    fetchUsers,
    updateUser,
    Role,
    UpdateUser,
    User, UserPreference, updatePreferenceToOff,
    updatePreferenceToOn, fetchUserPreferences
} from "@/lib/api";
import {Stack} from "expo-router";
import {Picker} from "@react-native-picker/picker";
import {useSession} from "@/app/contexts/session-context";

/**
 * User settings and role-management screen.
 * 
 * All authenticated users can update their own:
 * - display name
 * - notification preference
 * 
 * The screen also contains user/role selectors used to change account roles.
 * Role-management authorization should ultimately be enforced for admins only.
 * 
 * IMPORTANT:
 * The frontend currently exposes the role controls to all users for testing.
 * Backend authorization should remain the source of truth for privileged
 * operations. When testing is complere, restore the frontend admin restriction
 * so non-admin users do not see role-management controls.
 */
export default function SettingsScreen() {
    // Personal profile settings for the currently authenticated user.
    const [displayName, setDisplayName] = useState("");

    // Role-management lookup and selection state.
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [loadingRoles, setLoadingRoles] = useState(false);
    
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    // Notification-preference lookup and selection state.
    const [userPreference, setUserPreference] = useState<UserPreference[]>([]);
    const [selectedUserPreferenceId, setSelectedUserPreferenceId] = useState<string>("");
    const [loadingUserPreferences, setLoadingUserPreferences] = useState(false);
    
    const [submitting, setSubmitting] = useState(false);

    // User-facing result messages shown after Save Changes.
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    /*
        `user` is the authenticated user stored in SessionContext.

        `refreshSession()` should be called after changing the current user's
        profile, preference, or role so the rest of the frontend immediately sees 
        the updated database-backed user information.
    */
    const { user, isAdmin, refreshSession } = useSession();
    const { user, isAdmin, refreshSession, signOut } = useSession();

    /*
        Load available application roles from the backend.

        These values populate the role-management Picker below.
    */
    useEffect(() => {
        const loadRoles = async () => {
            setLoadingRoles(true);
            try {
                const data = await fetchRoles();
                setRoles(data);
            } catch (err) {
                console.error("Error fetching roles:", err);
                Alert.alert("Error", "Could not load role options.");
            } finally {
                setLoadingRoles(false);
            }
        };

        loadRoles();
    }, []);

    /*
        Load users available for role management.

        The authenticated user is inserted into the local list first so Settings
        still has useful account data if loading the complere user list fails.

        TODO:
        Role-management visibility is intetionally unrestricted in the frontend
        during testing. Restore `if (!isAdmin) return;` when only admins should be
        able to view these controls.
    */
    useEffect(() => {
        if (!user) return;

        setUsers([user]);

       // TODO: Re-enable after role-management testing is complete.
       // if (!isAdmin) return;

        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const data = await fetchUsers();

                // Avoid duplicating the current user if the backend already returned it.
                const allUsers = data.some(
                    (userOption) => userOption.id === user.id
                )
                    ? data
                    : [user, ...data];
    
                // Fall back to the authenticated user if the full lookup fails.
                setUsers(allUsers);
            } catch (err) {
                console.error("Error fetching users:", err);
                Alert.alert("Error", "Could not load user options.");

                setUsers([user]);
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, [user, isAdmin]);

    /*
        Load the lookup values used by the notification-preference Picker.

        The backend currently provides shared preference values such as "on"
        and "off"; the authenticated user references one of those values.
    */
    useEffect(() => {
        const loadUserPreferences = async () => {
            setLoadingUserPreferences(true);
            try {
                const data = await fetchUserPreferences();
                setUserPreference(data);
            } catch (err) {
                console.error("Error fetching user preferences:", err);
                Alert.alert("Error", "Could not load user preference options.");
            } finally {
                setLoadingUserPreferences(false);
            }
        };

        loadUserPreferences();
    }, []);

    /*
        Save any settings that the user changes.

        The form allows several independent updates in one submission:
        - current user's display name
        - current user's notification preference
        - selected user's role

        Blank fields are ignored rather than overwriting existing values.
    */
    const handleSubmit = async () => {
        setSaveMessage(null);
        setSaveError(null);

        /*
            Role cahnges require both a target user and a new role.
            Prevent accidentally submitting only half of that relationship.
        */
        if (
            (selectedRoleId && !selectedUserId) ||
            (!selectedRoleId && selectedUserId) 
        ) {
            setSaveError("Please select both a user and a role.");
            return;
        }

        const payload: UpdateUser = {
            displayName: displayName.trim(),
        };

        setSubmitting(true);

        try {
            // Update the currently authenticated user's display name.
            if (displayName != "") {
            await updateUser(payload);
             }

            /*
                Notification preferences currently depend on seeded databse IDs:
                    1 = on
                    2 = off
                
                If preference IDs ever become dynamic, this should instead use the
                preference value returned by the backend rather than fixed IDs.
            */
            if (selectedUserPreferenceId != "") {
                if (selectedUserPreferenceId == "1") {
                    await updatePreferenceToOn()
                } else if (selectedUserPreferenceId == "2") {
                    await updatePreferenceToOff()
                }
            }

            /*
                Role assignment currently depends on seeded role IDs:
                    1 = user
                    2 = event_organizer
                    3 = admin

                If role IDs become dynamic, use the selected Role's `roleName`
                instead of relying on these fixed numeric IDs.
            */
            if (selectedRoleId && selectedUserId != "") {
                const userId = Number(selectedUserId);
                if (selectedRoleId == "3") {
                    await assignAdmin(userId); }
                else if (selectedRoleId == "2") {
                    await assignOrganizer(userId); }
                else if (selectedRoleId == "1") {
                    await assignUser(userId); } }

            /*
                Re-fetch `/api/users/me` after updates so SessionContext reflects any
                changes to the current user's name, preference, or role immediately.
            */
            await refreshSession();

            if (selectedRoleId || selectedUserId || selectedUserPreferenceId || displayName != "") {
            setSaveMessage("User details updated successfully!"); }

            // Clear selections after a successful save.
            setDisplayName("");
            setSelectedUserPreferenceId("");
            setSelectedUserId("");
            setSelectedRoleId("");

        } catch (err: any) {
            console.error("Error updating user details:", err);
            setSaveError(
                err.message ?? "Something went wrong while updating user details."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);

            if (Platform.OS === "web") {
                window.alert("Sign out failed. Please try again.");
            } else {
                Alert.alert("Sign out failed", "Please try again.");
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <>
                <Stack.Screen options={{ title: "Settings" }} />
                <ScrollView contentContainerStyle={styles.scrollContainer}
                            keyboardShouldPersistTaps="handled">
                    <Text style={styles.bigText}>Edit User Details</Text>

                    {user?.displayName && (
                        <Text style={styles.label}>
                            Your Current Display Name: {user.displayName}
                        </Text>
                    )}

                    <Text style={styles.label}>Update Your Display Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter a new display name"
                        placeholderTextColor="#666"
                        value={displayName}
                        onChangeText={setDisplayName}
                        editable={!submitting}
                    />

                    {user?.userPreference.notificationPreference && (
                        <Text style={styles.label}>
                            Your Current Notification Preference: {user.userPreference.notificationPreference}
                        </Text>
                    )}

                        <Text style={styles.label}>Update Notification Settings</Text>
                        <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedUserPreferenceId}
                            enabled={!submitting && !loadingUserPreferences}
                            onValueChange={(itemValue) =>
                                setSelectedUserPreferenceId(String(itemValue))
                            }
                        >

                        <Picker.Item
                                label={loadingUserPreferences ? "Loading preferences..." : "Select a preference..."}
                                value=""
                        />

                        {userPreference.map((userPreference) => (
                            <Picker.Item
                                key={userPreference.id}
                                label={userPreference.notificationPreference}
                                value={String(userPreference.id)}
                            />
                        ))}
                        </Picker>
                        </View>

                    <Text style={styles.label}>User</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedUserId}
                            enabled={!submitting && !loadingUsers}
                            onValueChange={(itemValue) =>
                                setSelectedUserId(String(itemValue))
                            }
                        >
                            <Picker.Item
                                label={loadingUsers ? "Loading users..." : "Select a user..."}
                                value=""
                            />
                            {users.map((user) => (
                                <Picker.Item
                                    key={user.id}
                                    label={user.email}
                                    value={String(user.id)}
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Role</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedRoleId}
                            enabled={!submitting && !loadingRoles}
                            onValueChange={(itemValue) =>
                                setSelectedRoleId(String(itemValue))
                            }
                        >
                            <Picker.Item
                                label={loadingRoles ? "Loading roles..." : "Select a role..."}
                                value=""
                            />
                            {roles.map((role) => (
                                <Picker.Item
                                    key={role.id}
                                    label={role.roleName}
                                    value={String(role.id)}
                                />
                            ))}
                        </Picker>
                    </View>

    {saveMessage && <Text style={styles.successText}>{saveMessage}</Text>}
    {saveError && <Text style={styles.errorText}>{saveError}</Text>}

    <View style={styles.buttonWrapper}>
        <Button
            title={submitting ? "Saving..." : "Save Changes"}
            onPress={handleSubmit}
            disabled={submitting}
        />
    </View>

    <View style={styles.signOutWrapper}>
        <Button
            title="Sign Out"
            onPress={handleSignOut}
            color="#B00020"
        />
    </View>
</ScrollView>
</>
</KeyboardAvoidingView>
);
}



    const styles = StyleSheet.create({
        gradient: {
            flex: 1,
        },
        scrollContainer: {
            flexGrow: 1,
            padding: 16,
            paddingBottom: 40,
        },
        bigText: {
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 8,
            textAlign: "center",
        },
        subText: {
            fontSize: 14,
            color: "#555",
            marginBottom: 16,
            textAlign: "center",
        },
        label: {
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 6,
            color: "#00235D",
        },
        pickerWrapper: {
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            marginBottom: 12,
            backgroundColor: "#fff",
            overflow: "hidden",
        },
        title: {
            fontSize: 36,
            fontWeight: '800',
            color: 'white',
            textAlign: 'center',
            marginBottom: 4,
        },
        subheader: {
            color: 'white',
            fontSize: 16,
            opacity: 0.85,
            textAlign: 'center',
            marginBottom: 30,
        },
        settingRow: {
            marginBottom: 28,
        },
        settingLabel: {
            fontSize: 18,
            color: 'white',
            fontWeight: '700',
            marginBottom: 12,
        },
        inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        input: {
            width: 240,
            height: 44,
            borderWidth: 1,
            borderColor: '#999',
            borderRadius: 8,
            padding: 12,
            color: '#000',
            backgroundColor: "#fff",
            marginBottom: 20,
        },
        addButton: {
            backgroundColor: 'white',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
        },
        addButtonText: {
            fontWeight: '700',
            color: '#0054A6',
        },
        buttonWrapper: {
            marginTop: 16,
        },
        signOutWrapper: {
            marginTop: 24,
        },
        errorText: {
            fontSize: 16,
            color: "red",
            textAlign: "center",
        },
        restrictionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingVertical: 4,
            paddingHorizontal: 8,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
        },
        restrictionItem: {
            color: 'white',
            fontSize: 16,
        },
        removeText: {
            color: '#FF5555',
            fontSize: 14,
            fontWeight: '600',
        },
        successText: {
            fontSize: 16,
            color: "green",
            textAlign: "center",
            marginBottom: 12,
        },
    });