package org.example.mycrud.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.example.mycrud.entity.User;
import org.example.mycrud.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class JwtUtils {

    @Value("${mycrud.jwtSecret}")
    private String jwtSecret;

    @Value("${mycrud.jwtExpiration}")
    private int jwtExprition;

    @Value("${mycrud.jwtRefreshExperition}")
    private int jwtRefrehExprition;

    public String generateToken(UserDetailsImpl userDetailsImpl, List<String> authorities) {
        return Jwts.builder()
                .subject(userDetailsImpl.getUsername())
                .claim("userId", userDetailsImpl.getId())
                .claim("Role", authorities)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(jwtExprition)))
                .signWith(generateKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(UserDetailsImpl userDetailsImpl) {
        return Jwts.builder()
                .subject(userDetailsImpl.getUsername())
                .claim("userId", userDetailsImpl.getId())
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(jwtRefrehExprition)))
                .signWith(generateKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private SecretKey generateKey() {
        byte[] decodedKey = Base64.getDecoder().decode(jwtSecret);
        return Keys.hmacShaKeyFor(decodedKey);
    }

    public Claims getUserFromToken(String token){
        return Jwts.parser()
                .setSigningKey(generateKey()).build()
                .parseSignedClaims(token)
                .getPayload();
    }


    public User getUserFromToken(HttpServletRequest request){
        User user = new User();
        try{
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken.startsWith("Bearer ")) {
                bearerToken = bearerToken.substring(7);
            }

            Claims claims = Jwts.parser()
                    .setSigningKey(generateKey()).build()
                    .parseSignedClaims(bearerToken)
                    .getPayload();

            Integer id = Integer.parseInt(claims.get("userId").toString());
            user.setId(id);
        }catch (Exception e){
            e.printStackTrace();
        }
        return user;
    }

    public String getUserNameFromToken(HttpServletRequest request) {
        try {
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken.startsWith("Bearer ")) {
                bearerToken = bearerToken.substring(7);
            }

            return Jwts.parser()
                    .setSigningKey(generateKey()).build()
                    .parseSignedClaims(bearerToken)
                    .getPayload().getSubject();

        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return null;
    }

    public String getUserNameFromToken(String token){
        return Jwts.parser()
                .setSigningKey(generateKey()).build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public Integer getIdFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(generateKey()).build()
                    .parseClaimsJws(token)
                    .getPayload();
            return (Integer) claims.get("userId");
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return null;
    }

    public Integer getUserIdFromJwtToken(HttpServletRequest request) {
        try {
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken.startsWith("Bearer ")) {
                bearerToken = bearerToken.substring(7);
            }

            Claims claims = Jwts.parser()
                    .setSigningKey(generateKey()).build()
                    .parseSignedClaims(bearerToken)
                    .getPayload();

            return (Integer) claims.get("userId");
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return null;
    }


    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(generateKey()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }

        return false;
    }
}