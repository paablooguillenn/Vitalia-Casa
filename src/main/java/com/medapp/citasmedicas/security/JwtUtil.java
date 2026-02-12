package com.medapp.citasmedicas.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    private static final String DEFAULT_SECRET_BASE64 = "bXljbGF2ZURlZmF1bHRUMjU2Qml0c1NlZ3VyYVBhcGFjaXRhc01lZGljYXMyMDI2XYZxV2VydHlTZWNyZXQxMjM0NTY3ODkw"; // 48 bytes Base64 válido
    private final SecretKey secretKey;

    public JwtUtil(@Value("${jwt.secret:" + DEFAULT_SECRET_BASE64 + "}") String secret) {
        this.secretKey = buildKey(secret);
        logger.debug("JWT Util inicializado con clave segura (longitud: {} bytes)", secretKey.getEncoded().length);
    }

    // Resto de métodos iguales...
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))  // 10 horas
                .signWith(secretKey)
                .compact();
    }

    private SecretKey buildKey(String secret) {
        if (secret == null || secret.trim().isEmpty()) {
            logger.warn("No jwt.secret proporcionado; usando default Base64 seguro");
            secret = DEFAULT_SECRET_BASE64;
        }

        // Fuerza el uso de texto plano
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        System.out.println("KEY BYTES FORZADO UTF-8: " + keyBytes.length);
        if (keyBytes.length < 32) {
            keyBytes = sha256(keyBytes);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private byte[] sha256(byte[] input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
