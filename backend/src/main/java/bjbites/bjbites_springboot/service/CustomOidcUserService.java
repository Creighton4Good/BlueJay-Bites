package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Loads the Entra (OIDC) user, provisions them in our database if needed,
 * and attaches their application role from the database as a granted authority.
 * This is what makes {@code @PreAuthorize("hasAuthority('admin')")} and the
 * organizer/user checks work against roles stored in our own database (#177).
 */
@Service
public class CustomOidcUserService extends OidcUserService {

    @Autowired
    private UserProvisioningService userProvisioningService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // Let Spring load the standard OIDC user from Entra first.
        OidcUser oidcUser = super.loadUser(userRequest);

        // Find or create the matching user in our database (JIT provisioning).
        User appUser = userProvisioningService.getOrCreateUser(oidcUser);

        // Attach the user's application role as a granted authority so that
        // role-based checks in the controllers work.
        List<GrantedAuthority> authorities = new ArrayList<>(oidcUser.getAuthorities());
        String roleName = appUser.getRole().getRoleName();
        authorities.add(new SimpleGrantedAuthority(roleName));

        // Rebuild the OIDC user with the added authority. "sub" is the standard
        // token claim used as the username key.
        return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), "sub");
    }
}
