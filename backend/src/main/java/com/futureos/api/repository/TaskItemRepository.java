package com.futureos.api.repository;

import com.futureos.api.model.TaskItem;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskItemRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findByUser(User user);

    @Query("select case when count(t) > 0 then true else false end from TaskItem t where t.id = :taskId and t.user.id = :userId")
    boolean existsByIdAndUserId(@Param("taskId") Long taskId, @Param("userId") Long userId);
}