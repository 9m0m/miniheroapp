package com.worldhero.repository;

import com.worldhero.model.entity.ContentVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentVersionRepository extends JpaRepository<ContentVersionEntity, UUID> {
    Optional<ContentVersionEntity> findByContentTypeAndVersionTag(String contentType, String versionTag);
    Optional<ContentVersionEntity> findFirstByContentTypeAndStatusOrderByPublishedAtDesc(String contentType, String status);
    List<ContentVersionEntity> findByContentTypeOrderByCreatedAtDesc(String contentType);
    List<ContentVersionEntity> findAllByOrderByCreatedAtDesc();
}
