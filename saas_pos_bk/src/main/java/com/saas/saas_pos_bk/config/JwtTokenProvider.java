package com.saas.saas_pos_bk.config;

import com.saas.saas_pos_bk.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long validityInMilliseconds;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:SuperSecureDefaultKeyForSaasPosSystemAtLeast32BytesLong}") String secret,
            @Value("${app.jwt.expiration:86400000}") long validityInMilliseconds // 24 hours
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validityInMilliseconds = validityInMilliseconds;
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uId", user.getUId());
        claims.put("uName", user.getUName());
        claims.put("role", user.getRole().name());
        claims.put("sub", user.getUEmail());
        claims.put("email", user.getUEmail());
        if (user.getBusiness() != null) {
            claims.put("bId", user.getBusiness().getBId());
            claims.put("bName", user.getBusiness().getBName());
        }

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUEmail())
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = getClaims(token);
        String subject = claims.getSubject();
        if (subject != null && !subject.isBlank()) {
            return subject;
        }
        String sub = claims.get("sub", String.class);
        if (sub != null && !sub.isBlank()) {
            return sub;
        }
        return claims.get("email", String.class);
    }

    public String getRoleFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("role", String.class);
    }

    public Long getBusinessIdFromToken(String token) {
        Claims claims = getClaims(token);
        Object bId = claims.get("bId");
        if (bId instanceof Number) {
            return ((Number) bId).longValue();
        }
        return null;
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
