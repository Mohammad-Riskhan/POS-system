package com.saas.saas_pos_bk.util;

import com.saas.saas_pos_bk.entity.User;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new BadRequestException("No authenticated user found in security context");
        }
        String email = authentication.getName();
        return userRepository.findByUEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with email: " + email));
    }

    public Long getCurrentBusinessId() {
        User user = getCurrentAuthenticatedUser();
        if (user.getBusiness() == null) {
            throw new BadRequestException("Current user is not associated with any business");
        }
        return user.getBusiness().getBId();
    }
}
