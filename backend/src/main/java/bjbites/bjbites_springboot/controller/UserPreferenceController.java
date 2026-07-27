package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.entity.UserPreference;
import bjbites.bjbites_springboot.repository.UserPreferenceRepository;
import bjbites.bjbites_springboot.service.UserProvisioningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-preferences")
public class UserPreferenceController {

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;
    @Autowired
    private UserProvisioningService userProvisioningService;

    // Get all user preferences
    /**
     * Get all user preferences
     * @return a {@code ResponseEntity} containing all the user preferences with {@code 200 OK}
     */
   @PreAuthorize("hasAuthority('admin')")
   @GetMapping("/all")
   public ResponseEntity<List<UserPreference>> getAllUserPreferences() {
       List<UserPreference> preferences = userPreferenceRepository.findAll();
       return new ResponseEntity<>(preferences, HttpStatus.OK);
   }

   // Get user preference by id
    /**
     * Get user preference by id
     * @param id the ID of the user preference to retrieve
     * @return a {@code ResponseEntity} containing the user preference by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no user preference exists with specified ID
     */
   @PreAuthorize("hasAuthority('admin')")
   @GetMapping("/{id}")
   public ResponseEntity<UserPreference> getUserPreferenceById(@PathVariable int id) {
       Optional<UserPreference> preference = userPreferenceRepository.findById(id);
       return preference.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
               .orElseGet(() -> ResponseEntity.notFound().build());
   }

    // Update user preference to on
    /**
     * Update user preference to on
     * @param oAuthUser the authenticated user for the user preference
     * @return {@code 200 OK} if user preference is successfully updated,
     *      or {@code 404 Not Found} if the user data does not exist,
     *      or {@code 400 Bad Request} if the user's current preference is already "on"
     */
    @PatchMapping("/me/update/on")
    public ResponseEntity<Void> updateUserPreferenceToOn(@AuthenticationPrincipal OAuth2User oAuthUser) {
           // TODO: Ensure spring security checks authenticated user
           User currentUser = userProvisioningService.getOrCreateUser(oAuthUser);

           Optional<UserPreference> preferenceData = userPreferenceRepository.findByUser_Id(currentUser.getId());

           if (preferenceData.isPresent()) {
               UserPreference preference = preferenceData.get();

               if (Objects.equals("on", preference.getNotificationPreference())) {
                   return ResponseEntity.badRequest().build();
               }

               preference.setNotificationPreference("on");
               userPreferenceRepository.save(preference);
               return ResponseEntity.ok().build(); }
           else
               return ResponseEntity.notFound().build();
   }

    // Update user preference to off
    /**
     * Update user preference to off
     * @param oAuthUser the authenticated user for the user preference
     * @return {@code 200 OK} if user preference is successfully updated,
     *      or {@code 404 Not Found} if the user data does not exist,
     *      or {@code 400 Bad Request} if the user's current preference is already "off"
     */
    @PatchMapping("/me/update/off")
    public ResponseEntity<Void> updateUserPreferenceToOff(@AuthenticationPrincipal OAuth2User oAuthUser) {
        // TODO: Ensure spring security checks authenticated user
        User currentUser = userProvisioningService.getOrCreateUser(oAuthUser);

        Optional<UserPreference> preferenceData = userPreferenceRepository.findByUser_Id(currentUser.getId());

        if (preferenceData.isPresent()) {
            UserPreference preference = preferenceData.get();

            if (Objects.equals("off", preference.getNotificationPreference())) {
                return ResponseEntity.badRequest().build();
            }

            preference.setNotificationPreference("off");
            userPreferenceRepository.save(preference);
            return ResponseEntity.ok().build(); }
        else
            return ResponseEntity.notFound().build();
    }

    // Create new user preference
    /**
     * Create new user preference
     * @param userPreference the user preference to create
     * @return a {@code ResponseEntity} containing the created user preference with {@code 201 Created},
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<UserPreference> createUserPreference(@RequestBody UserPreference userPreference) {
        try {
            UserPreference savedPreference = userPreferenceRepository.save(userPreference);
            return new ResponseEntity<>(savedPreference, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    // Delete user preference
    /**
     * Delete user preference
     * @param id the ID of the user preference to delete
     * @return {@code 204 No Content} if user preference is successfully deleted,
     *          or {@code 404 Not Found} if no user preference exists with specified ID,
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserPreference(@PathVariable int id) {
        try {
            Optional<UserPreference> userPreference = userPreferenceRepository.findById(id);
            if (userPreference.isPresent()) {
                UserPreference existingPreference = userPreference.get();
                userPreferenceRepository.delete(existingPreference);
                return ResponseEntity.noContent().build(); }
            else {
                return ResponseEntity.notFound().build(); }
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError().build(); }
    }
}