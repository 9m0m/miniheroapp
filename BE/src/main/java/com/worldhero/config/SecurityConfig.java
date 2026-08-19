package com.worldhero.config;

import com.worldhero.config.security.JwtAuthFilter;
import com.worldhero.config.security.LocalDevAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.util.StringUtils;
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

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectProvider<LocalDevAuthFilter> localDevAuthFilterProvider;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001}")
    private String allowedOriginsConfig;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Explicit Public Login / Verification Endpoints
                        .requestMatchers(
                                "/api/v1/auth/world-id",
                                "/api/v1/auth/local-login",
                                "/api/v1/auth/admin/login",
                                "/api/v1/admin/login",
                                "/api/v1/health/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/error"
                        ).permitAll()
                        // Public GET for Item Templates and Math Engine
                        .requestMatchers(HttpMethod.GET, "/api/v1/item-templates/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/math-engine/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/math/**").permitAll()
                        // Admin Protected Endpoints
                        .requestMatchers("/api/v1/admin/**", "/api/v1/arena/admin/**").hasAnyRole("ADMIN", "SUPERADMIN")
                        // All Other Mutation & Player Endpoints require Authentication (including /api/v1/auth/me)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        LocalDevAuthFilter localDevFilter = localDevAuthFilterProvider.getIfAvailable();
        if (localDevFilter != null) {
            http.addFilterAfter(localDevFilter, JwtAuthFilter.class);
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOriginsConfig.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();

        config.setAllowedOrigins(origins.isEmpty() ? List.of("http://localhost:3000") : origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "X-Mock-User-Id"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
