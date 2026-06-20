package com.futureos.api.repository;

import com.futureos.api.model.TaskItem;
import com.futureos.api.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskItemRepository extends JpaRepository<TaskItem, Long> {
  List<TaskItem> findByUser(User user);
}
