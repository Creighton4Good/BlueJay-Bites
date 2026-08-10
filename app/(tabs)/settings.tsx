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
// TODO: Enforce admin checks when updating user roles

export default function SettingsScreen() {
    const [displayName, setDisplayName] = useState("");
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userPreference, setUserPreference] = useState<UserPreference[]>([]);
    const [selectedUserPreferenceId, setSelectedUserPreferenceId] = useState<string>("");
    const [loadingUserPreferences, setLoadingUserPreferences] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { user, isAdmin, refreshSession } = useSession();


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

    useEffect(() => {
        if (!user) return;

        setUsers([user]);

       // if (!isAdmin) return;

        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const data = await fetchUsers();

                const allUsers = data.some(
                    (userOption) => userOption.id === user.id
                )
                    ? data
                    : [user, ...data];
    
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

    const handleSubmit = async () => {
        setSaveMessage(null);
        setSaveError(null);

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

            if (displayName != "") {
            await updateUser(payload);
             }

            if (selectedUserPreferenceId != "") {
                if (selectedUserPreferenceId == "1") {
                    await updatePreferenceToOn()
                } else if (selectedUserPreferenceId == "2") {
                    await updatePreferenceToOff()
                }
            }

            if (selectedRoleId && selectedUserId != "") {
                const userId = Number(selectedUserId);
                if (selectedRoleId == "3") {
                    await assignAdmin(userId); }
                else if (selectedRoleId == "2") {
                    await assignOrganizer(userId); }
                else if (selectedRoleId == "1") {
                    await assignUser(userId); } }

            await refreshSession();

            if (selectedRoleId || selectedUserId || selectedUserPreferenceId || displayName != "") {
            setSaveMessage("User details updated successfully!"); }

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