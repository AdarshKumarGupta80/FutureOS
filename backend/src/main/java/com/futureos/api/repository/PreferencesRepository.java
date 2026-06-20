package com.futureos.api.repository;

import com.futureos.api.model.Preferences;
import com.futureos.api.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreferencesRepository extends JpaRepository<Preferences, Long> {
  Optional<Preferences> findByUser(User user);
}
