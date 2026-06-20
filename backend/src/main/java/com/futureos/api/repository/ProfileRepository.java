package com.futureos.api.repository;

import com.futureos.api.model.Profile;
import com.futureos.api.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
  Optional<Profile> findByUser(User user);
}
