package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Role;
import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.entity.UserPreference;
import bjbites.bjbites_springboot.repository.RoleRepository;
import bjbites.bjbites_springboot.repository.UserPreferenceRepository;
import bjbites.bjbites_springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Handles just-in-time (JIT) provisioning of users authenticated through
 * Microsoft Entra. On first sign-in a user will not yet exist in our database,
 * so this service creates them with a default role rather than failing.
 */
@Service
public class UserProvisioningService {

    // Default role assigned to a newly provisioned user on first sign-in.
    private static final String DEFAULT_ROLE = "user";
    private static final String ADMIN_ROLE = "admin";

    // Comma-separated emails configured to be provisioned as admin on first login.
    @Value("${app.admin-emails:}")
    private String adminEmails;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    /**
     * Returns the application {@link User} matching the authenticated Entra
     * principal, creating the user with the default role if they do not yet
     * exist (just-in-time provisioning).
     *
     * @param oAuthUser the authenticated Entra principal
     * @return the existing or newly created application user
     */
    public User getOrCreateUser(OAuth2User oAuthUser) {
        String email = oAuthUser.getAttribute("email");
        if (email == null) {
            // Some Entra tokens expose the email under "preferred_username".
            email = oAuthUser.getAttribute("preferred_username");
        }
        if (email == null) {
            throw new IllegalStateException("No email found on the authenticated user token.");
        }

        final String userEmail = email;
        return userRepository.findByEmail(userEmail)
                .orElseGet(() -> createUser(oAuthUser, userEmail));
    }

    private User createUser(OAuth2User oAuthUser, String email) {
        String roleName = isAdminEmail(email) ? ADMIN_ROLE : DEFAULT_ROLE;
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new IllegalStateException(
                        "Role '" + roleName + "' is not present in the database."));

        String displayName = oAuthUser.getAttribute("name");
        if (displayName == null) {
            displayName = email;
        }
        String startingPreference = "on";
        UserPreference userPreference = userPreferenceRepository.findByNotificationPreference(startingPreference)
                .orElseThrow(() -> new IllegalStateException(
                        "Preference '" + startingPreference + "' is not present in the database."));

        String entraId = oAuthUser.getAttribute("oid");
        User newUser = new User(email, displayName, role, userPreference, entraId);

        return userRepository.save(newUser);
    }

    /**
     * Returns true if the given email is in the configured admin allowlist.
     * This solves the bootstrap problem of creating the first admin, who can
     * then assign roles to other users.
     */
    private boolean isAdminEmail(String email) {
        if (adminEmails == null || adminEmails.isBlank()) {
            return false;
        }
        for (String allowed : adminEmails.split(",")) {
            if (allowed.trim().equalsIgnoreCase(email)) {
                return true;
            }
        }
        return false;
    }
}
