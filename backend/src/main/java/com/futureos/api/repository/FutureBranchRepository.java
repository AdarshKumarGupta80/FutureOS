package com.futureos.api.repository;

import com.futureos.api.model.FutureBranch;
import com.futureos.api.model.User;
import java.util.List;
import java.util.Optional;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FutureBranchRepository extends JpaRepository<FutureBranch, Long> {
    List<FutureBranch> findByUserOrderByScoreDesc(User user);

    @Modifying
    @Transactional
    void deleteByUser(User user);

    @Query("SELECT f FROM FutureBranch f WHERE f.id = :id AND f.user.id = :userId")
    Optional<FutureBranch> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}