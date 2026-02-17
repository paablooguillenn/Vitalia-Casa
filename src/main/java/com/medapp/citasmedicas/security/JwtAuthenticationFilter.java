package com.medapp.citasmedicas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        System.out.println("[JWT] Authorization header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            System.out.println("[JWT] Token recibido: " + token);
            try {
                username = jwtUtil.extractUsername(token);
                System.out.println("[JWT] Username extraído: " + username);
            } catch (Exception e) {
                System.out.println("[JWT] Error extrayendo username: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            boolean valid = false;
            try {
                valid = jwtUtil.validateToken(token, userDetails);
                System.out.println("[JWT] ¿Token válido?: " + valid);
            } catch (Exception e) {
                System.out.println("[JWT] Error validando token: " + e.getMessage());
            }
            if (valid) {
                // Leer el rol del claim y crear authorities
                String role = null;
                try {
                    Object claimRole = jwtUtil.extractClaim(token, claims -> claims.get("role"));
                    if (claimRole != null) {
                        role = claimRole.toString();
                    }
                    System.out.println("[JWT] Rol extraído: " + role);
                } catch (Exception ignored) {}
                java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities;
                if (role != null) {
                    authorities = java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(role));
                } else {
                    authorities = userDetails.getAuthorities();
                }
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("[JWT] Token inválido para usuario: " + username);
            }
        }
        filterChain.doFilter(request, response);
    }
}
