package com.worldhero.config.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String worldIdHash;
    private final String displayName;
    private final String role;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String worldIdHash, String displayName, String role) {
        this.id = id;
        this.worldIdHash = worldIdHash;
        this.displayName = displayName;
        this.role = role != null ? role : "ROLE_USER";
        this.authorities = List.of(new SimpleGrantedAuthority(this.role.startsWith("ROLE_") ? this.role : "ROLE_" + this.role));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return id != null ? id.toString() : (worldIdHash != null ? worldIdHash : "anonymous");
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
