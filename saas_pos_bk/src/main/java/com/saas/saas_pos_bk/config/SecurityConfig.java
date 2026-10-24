package com.saas.saas_pos_bk.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Crucial: Allow unauthenticated preflight OPTIONS requests for all endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/login", "/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/auth/register", "/api/v1/auth/register").permitAll()
                        .requestMatchers("/api/auth/me", "/api/v1/auth/me").authenticated()
                        .requestMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Platform Super Admin only: strictly guarded
                        .requestMatchers("/api/admin/**").hasAnyRole("SUPER_ADMIN", "OWNER")

                        // Batch item lookups (accessible to Cashiers and Business Owners)
                        .requestMatchers("/api/business/batches/item/**").hasAnyRole("SUPER_ADMIN", "BUSINESS_OWNER", "CASHIER")

                        // Business Owner endpoints
                        .requestMatchers("/api/business/**").hasAnyRole("SUPER_ADMIN", "BUSINESS_OWNER")

                        // Cashier / POS Terminal endpoints
                        .requestMatchers("/api/pos/**").hasAnyRole("SUPER_ADMIN", "BUSINESS_OWNER", "CASHIER")

                        // Any other request authenticated
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":401,\"message\":\"Unauthorized: " + authException.getMessage() + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":403,\"message\":\"Forbidden: Access denied\"}");
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "https://saas-pos-syste.netlify.app",
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        configuration.setAllowedOriginPatterns(List.of(
                "https://saas-pos-syste.netlify.app",
                "https://*.netlify.app",
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.web.servlet.config.annotation.WebMvcConfigurer corsConfigurer() {
        return new org.springframework.web.servlet.config.annotation.WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@org.springframework.lang.NonNull org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                                "https://saas-pos-syste.netlify.app",
                                "http://localhost:5173",
                                "http://localhost:3000"
                        )
                        .allowedOriginPatterns(
                                "https://saas-pos-syste.netlify.app",
                                "https://*.netlify.app",
                                "http://localhost:*",
                                "http://127.0.0.1:*"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("Authorization", "Content-Type", "X-Requested-With")
                        .exposedHeaders("Authorization", "Content-Type")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
