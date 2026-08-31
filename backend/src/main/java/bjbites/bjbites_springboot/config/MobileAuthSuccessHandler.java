package bjbites.bjbites_springboot.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import bjbites.bjbites_springboot.service.MobileAuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class MobileAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final MobileAuthService mobileAuthService;

    @Value("${app.frontend-url:http//localhost:8081}")
    private String frontendUrl;

    public MobileAuthSuccessHandler(MobileAuthService mobileAuthService) {
        this.mobileAuthService = mobileAuthService;
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {

        HttpSession session = request.getSession(false);

        boolean mobileLogin =
            session != null &&
            Boolean.TRUE.equals(session.getAttribute("MOBILE_LOGIN"));

        if (!mobileLogin) {
            response.sendRedirect(frontendUrl);
            return;
        }

        session.removeAttribute("MOBILE_LOGIN");

        String code = mobileAuthService.createCode(authentication);

        response.sendRedirect(
            "bjbites://auth/callback?code=" + code
        );
    }
}