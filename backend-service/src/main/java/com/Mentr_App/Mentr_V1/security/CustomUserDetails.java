package com.Mentr_App.Mentr_V1.security;


import com.Mentr_App.Mentr_V1.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * Custom UserDetails wrapper so we can access userId from JWT context.
 */
public class CustomUserDetails implements UserDetails {

    private final Long id;              // userId from DB
    private final String email;         // username for Spring Security
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Long id, String email, String password,
                             Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public Long getId() { return id; }   // 🔑 use this in controllers

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    /**
     * Firebase UID derived from our internal user id.
     * Contract: String.valueOf(userId).
     */
    public String getFirebaseUid() {
        return id != null ? String.valueOf(id) : null;
    }

}
