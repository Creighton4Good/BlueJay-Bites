package bjbites.bjbites_springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
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
            .oauth2Login(oauth2 -> {});

        return http.build();
    }
}
