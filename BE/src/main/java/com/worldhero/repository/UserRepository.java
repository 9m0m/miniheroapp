package com.worldhero.repository;

import com.worldhero.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByWorldIdHash(String worldIdHash);

    Optional<UserEntity> findFirstByOrderByCreatedAtAsc();
}
