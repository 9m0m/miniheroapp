package com.worldhero.repository;

import com.worldhero.model.entity.ChestInstanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChestInstanceRepository extends JpaRepository<ChestInstanceEntity, UUID> {

    List<ChestInstanceEntity> findByUser_IdAndIsOpenedFalseOrderByCreatedAtDesc(UUID userId);

    long countByUser_IdAndIsOpenedFalse(UUID userId);

    long countByUser_IdAndTemplateIdAndIsOpenedFalse(UUID userId, String templateId);

    Optional<ChestInstanceEntity> findFirstByUser_IdAndTemplateIdAndIsOpenedFalseOrderByCreatedAtAsc(UUID userId, String templateId);

    @Modifying
    @Query("UPDATE ChestInstanceEntity c SET c.isOpened = true, c.openedAt = :now WHERE c.id = :chestId AND c.user.id = :userId AND c.isOpened = false")
    int consumeChestAtomic(@Param("chestId") UUID chestId, @Param("userId") UUID userId, @Param("now") LocalDateTime now);
}
