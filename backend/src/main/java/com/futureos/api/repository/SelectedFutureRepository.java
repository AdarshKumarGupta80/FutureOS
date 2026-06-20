package com.futureos.api.repository;

import com.futureos.api.model.SelectedFuture;
import com.futureos.api.model.User;
import java.util.Optional;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

public interface SelectedFutureRepository extends JpaRepository<SelectedFuture, Long> {
    Optional<SelectedFuture> findByUser(User user);

    @Modifying
    @Transactional
    void deleteByUser(User user);
}