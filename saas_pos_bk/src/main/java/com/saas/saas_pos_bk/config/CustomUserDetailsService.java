package com.saas.saas_pos_bk.config;

import com.saas.saas_pos_bk.entity.Role;
import com.saas.saas_pos_bk.entity.User;
import com.saas.saas_pos_bk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByUEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        boolean enabled = !"DISABLED".equalsIgnoreCase(user.getStatus());

        Set<GrantedAuthority> authorities = new HashSet<>();
        String roleName = user.getRole().name();

        // 1. Grant base role name
        authorities.add(new SimpleGrantedAuthority(roleName));

        // 2. Ensure authority with "ROLE_" prefix is always present for Spring Security hasRole() checks
        String roleWithPrefix = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        authorities.add(new SimpleGrantedAuthority(roleWithPrefix));

        // 3. Strict Super Admin role assignment:
        if (user.getRole() == Role.ROLE_SUPER_ADMIN || user.getRole() == Role.ROLE_OWNER) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("SUPER_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_OWNER"));
            authorities.add(new SimpleGrantedAuthority("OWNER"));
        } else if (user.getRole() == Role.ROLE_BUSINESS_OWNER) {
            authorities.add(new SimpleGrantedAuthority("ROLE_BUSINESS_OWNER"));
            authorities.add(new SimpleGrantedAuthority("BUSINESS_OWNER"));
        } else if (user.getRole() == Role.ROLE_CASHIER) {
            authorities.add(new SimpleGrantedAuthority("ROLE_CASHIER"));
            authorities.add(new SimpleGrantedAuthority("CASHIER"));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUEmail(),
                user.getUPassword(),
                enabled,
                true,
                true,
                true,
                authorities
        );
    }
}
