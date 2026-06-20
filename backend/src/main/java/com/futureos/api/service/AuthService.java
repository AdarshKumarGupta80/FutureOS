package com.futureos.api.service;

import com.futureos.api.auth.JwtService;
import com.futureos.api.dto.AuthDtos.*;
import com.futureos.api.model.User;
import com.futureos.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
    this.users = users;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  public AuthResponse register(RegisterRequest request) {
    if (users.existsByEmail(request.email())) {
      throw new IllegalArgumentException("Email already registered");
    }
    User user = new User();
    user.fullName = request.fullName();
    user.email = request.email();
    user.passwordHash = encoder.encode(request.password());
    users.save(user);
    return new AuthResponse(jwt.generate(user.email), user.fullName);
  }

  public AuthResponse login(LoginRequest request) {
    User user = users.findByEmail(request.email()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    if (!encoder.matches(request.password(), user.passwordHash)) {
      throw new IllegalArgumentException("Invalid credentials");
    }
    return new AuthResponse(jwt.generate(user.email), user.fullName);
  }
}
