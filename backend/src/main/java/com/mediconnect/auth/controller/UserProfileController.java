package com.mediconnect.auth.controller;

import com.mediconnect.auth.model.UpdateUserProfileRequest;
import com.mediconnect.auth.model.UserProfileResponse;
import com.mediconnect.auth.service.UserProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/profile")
    public UserProfileResponse getProfile(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        return userProfileService.getProfile(authorizationHeader);
    }

    @PutMapping("/profile")
    public UserProfileResponse updateProfile(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @RequestBody UpdateUserProfileRequest request
    ) {
        return userProfileService.updateProfile(authorizationHeader, request);
    }
}
