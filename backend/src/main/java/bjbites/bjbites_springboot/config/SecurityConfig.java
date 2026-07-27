package bjbites.bjbites_springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import bjbites.bjbites_springboot.service.CustomOidcUserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomOidcUserService customOidcUserService;

    // Where users land after a successful login. Defaults to the local Expo
    // dev server; staging and production override this via app.frontend-url.
    @Value("${app.frontend-url:http://localhost:8081}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // API endpoints stay open for now so the app and local testing keep
                // working while the frontend login flow is still being built.
                // TODO: tighten to authenticated()/role-based once the frontend
                // OAuth flow and DB-backed role mapping are wired up.
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/actuator/**", "/admin/**", "/admin-dashboard/**", "/instances/**").permitAll()
                .anyRequest().authenticated()
            )
            // Enables OAuth2 login against Microsoft Entra via the Spring Cloud
            // Azure AD starter. Hitting a protected route redirects to Entra login.
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .oidcUserService(customOidcUserService))
                // Send the user back to the app after login instead of falling
                // through to the backend root, which has no page mapped.
                .defaultSuccessUrl(frontendUrl, true));

        return http.build();
    }

    // Global CORS config. Credentialed requests (cookies) require a specific
    // origin rather than "*", so we name the frontend origin and allow credentials.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
