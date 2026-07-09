package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.entity.UserPreference;
import bjbites.bjbites_springboot.repository.UserPreferenceRepository;
import bjbites.bjbites_springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-preferences")
@CrossOrigin(origins = "*")
public class UserPreferenceController {

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;
    @Autowired
    private UserRepository userRepository;

   // Get all user preferences
   @PreAuthorize("hasAuthority('admin')")
   @GetMapping("/all")
   public ResponseEntity<List<UserPreference>> getAllUserPreferences() {
       List<UserPreference> preferences = userPreferenceRepository.findAll();
       return new ResponseEntity<>(preferences, HttpStatus.OK);
   }

   // Get user preference by id
   @PreAuthorize("hasAuthority('admin')")
   @GetMapping("/{id}")
   public ResponseEntity<UserPreference> getUserPreferenceById(@PathVariable int id) {
       Optional<UserPreference> preference = userPreferenceRepository.findById(id);
       return preference.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
               .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
   }

    // Update user preference to on
    @PatchMapping("/{id}/update/on")
    public ResponseEntity<UserPreference> updateUserPreferenceToOn(@AuthenticationPrincipal OAuth2User oAuthUser) {
           // TODO: Ensure spring security checks authenticated user
           User currentUser = userRepository.findByEmail(oAuthUser.getAttribute("email")).orElseThrow();

           Optional<UserPreference> preferenceData = userPreferenceRepository.findByUser_Id(currentUser.getId());

           if (preferenceData.isPresent()) {
               UserPreference preference = preferenceData.get();

               if ("on".equals(preference.getNotificationPreference())) {
                   return ResponseEntity.badRequest().build();
               }

               preference.setNotificationPreference("on");
               userPreferenceRepository.save(preference);
               return new ResponseEntity<>(HttpStatus.OK); }
           else
               return new ResponseEntity<>(HttpStatus.NOT_FOUND);
   }

    // Update user preference to off
    @PatchMapping("/{id}/update/off")
    public ResponseEntity<UserPreference> updateUserPreferenceToOff(@AuthenticationPrincipal OAuth2User oAuthUser, @PathVariable int id) {
        // TODO: Ensure spring security checks authenticated user
        User currentUser = userRepository.findByEmail(oAuthUser.getAttribute("email")).orElseThrow();

        Optional<UserPreference> preferenceData = userPreferenceRepository.findByUser_Id(currentUser.getId());

        if (preferenceData.isPresent()) {
            UserPreference preference = preferenceData.get();

            if ("off".equals(preference.getNotificationPreference())) {
                return ResponseEntity.badRequest().build();
            }

            preference.setNotificationPreference("off");
            userPreferenceRepository.save(preference);
            return new ResponseEntity<>(HttpStatus.OK); }
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}