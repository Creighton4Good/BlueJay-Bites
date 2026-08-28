package bjbites.bjbites_springboot.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.sprignframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import bjbites.bjbites_springboot.service.MobileAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/mobile-auth")
public class MobileAuthController {

    private final MobileAuthService mobileAuthService;

    public MobileAuthController(MobileAuthService mobileAuthService) {
        this.mobileAuthService = mobileAuthService;
    }

    @GetMapping("/login")
    public void login(
        HttpServletRequest request,
        HttpServletResponse response
    ) throws IOException {

        HttpSession session = request.getSession(true);
        session.setAttribute("MOBILE_LOGIN", true);

        response.sendRedirect("/oauth2/authorization/azure");
    }

    @PostMapping("/exchange")
    public ResponseEntity<Void> exchange(
        @RequestBody Map<String, String> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        String code = body.get("code");

        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Authentication authentication =
            mobileAuthService.consumeCode(code);

        if (authentication == null) {
            return ResponseEntity 
                .status(HttpStatus.UNAUTHORIZED)
                .build();
        }

        SecurityContext context = 
            SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHodler.setContext(context);

        HttpSessionSecurityContextRepository repository =
            new HttpSessionSecurityContextRepository();

        repository.saveContext(
            context,
            request,
            response
        );

        return ResponseEntity.noContent().build();
    }
}