package com.saas.saas_pos_bk.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SecurityCorsTest {

    private final SecurityConfig securityConfig = new SecurityConfig(null);

    @Test
    void testCorsConfigurationSourceAllowsNetlifyAndLocalOrigins() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/login");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config, "CORS configuration must not be null");

        // Validate allowed origins
        List<String> origins = config.getAllowedOrigins();
        assertNotNull(origins, "Allowed origins should not be null");
        assertTrue(origins.contains("https://saas-pos-syste.netlify.app"));
        assertTrue(origins.contains("http://localhost:5173"));
        assertTrue(origins.contains("http://localhost:3000"));

        // Validate origin check for production frontend
        assertEquals("https://saas-pos-syste.netlify.app", config.checkOrigin("https://saas-pos-syste.netlify.app"));
        assertEquals("http://localhost:5173", config.checkOrigin("http://localhost:5173"));
        assertEquals("http://localhost:3000", config.checkOrigin("http://localhost:3000"));

        // Validate origin pattern check for preview deployments
        assertEquals("https://preview-deploy.netlify.app", config.checkOrigin("https://preview-deploy.netlify.app"));

        // Validate disallowed origin rejection
        assertNull(config.checkOrigin("https://malicious-domain.com"));

        // Validate HTTP methods allowed
        List<String> methods = config.getAllowedMethods();
        assertNotNull(methods);
        assertTrue(methods.containsAll(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")));

        // Validate headers allowed
        List<String> headers = config.getAllowedHeaders();
        assertNotNull(headers);
        assertTrue(headers.containsAll(List.of("Authorization", "Content-Type", "X-Requested-With")));

        // Validate credentials allowed
        assertTrue(Boolean.TRUE.equals(config.getAllowCredentials()));

        // Validate exposed headers
        List<String> exposedHeaders = config.getExposedHeaders();
        assertNotNull(exposedHeaders);
        assertTrue(exposedHeaders.containsAll(List.of("Authorization", "Content-Type")));
    }
}
