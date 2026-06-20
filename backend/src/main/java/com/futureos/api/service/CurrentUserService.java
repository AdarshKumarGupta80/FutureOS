package com.futureos.api.service;

import com.futureos.api.model.User;
import com.futureos.api.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
  private final UserRepository users;

  public CurrentUserService(UserRepository users) {
    this.users = users;
  }

  public User get() {
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    return users.findByEmail(email).orElseThrow();
  }
}
