package com.futureos.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
  public record RegisterRequest(@NotBlank String fullName, @Email @NotBlank String email, @NotBlank @Size(min = 8) String password) {}
  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
  public record AuthResponse(String token, String fullName) {}
}
