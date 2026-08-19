package com.worldhero.config.security;

import com.worldhero.model.entity.UserEntity;
import com.worldhero.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Profile({"dev", "test"})
@RequiredArgsConstructor
@Slf4j
public class LocalDevAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        // If already authenticated by Bearer JWT, proceed
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String mockUserIdHeader = request.getHeader("X-Mock-User-Id");
        UserEntity user = null;

        if (StringUtils.hasText(mockUserIdHeader)) {
            try {
                UUID userId = UUID.fromString(mockUserIdHeader);
                user = userRepository.findById(userId).orElse(null);
            } catch (IllegalArgumentException ignored) {}
        }

        if (user == null) {
            user = userRepository.findFirstByOrderByCreatedAtAsc().orElse(null);
        }

        if (user != null) {
            UserPrincipal principal = new UserPrincipal(
                    user.getId(),
                    user.getWorldIdHash(),
                    user.getDisplayName(),
                    "ROLE_USER"
            );
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
