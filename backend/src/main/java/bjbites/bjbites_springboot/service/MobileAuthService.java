package bjbites.bjbites_springboot.service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class MobileAuthService {
    
    private static final long CODE_LIFETIME_SECONDS = 120;

    private final Map<String, PendingAuth> pendingAuths = new ConcurrentHashMap<>();

    public String createCode(Authentication authentication) {
        cleanupExpired();

        String code = UUID.randomUUID().toString();

        pendingAuths.put(
            code, 
            new PendingAuth(
                authentication,
                Instant.now().plusSeconds(CODE_LIFETIME_SECONDS)
            )
        );

        return code;
    }

    public Authentication consumeCode(String code) {
        PendingAuth pending = pendingAuths.remove(code);

        if (pending == null || pending.expiresAt().isBefore(Instant.now())) {
            return null;
        }

        return pending.authentication();
    }

    private void cleanupExpired() {
        Instant now = Instant.now();

        pendingAuths.entrySet().removeIf(
            entry -> entry.getValue().expiresAt().isBefore(now)
        );
    }

    private record PendingAuth(
        Authentication authentication,
        Instant expiresAt
    ) {}
}