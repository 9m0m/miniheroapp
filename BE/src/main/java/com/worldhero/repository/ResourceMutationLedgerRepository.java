package com.worldhero.repository;

import com.worldhero.model.entity.ResourceMutationLedgerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceMutationLedgerRepository extends JpaRepository<ResourceMutationLedgerEntity, UUID> {

    /**
     * Finds an existing committed mutation record without locking — used for cheap pre-checks.
     */
    Optional<ResourceMutationLedgerEntity> findByUserIdAndOperationTypeAndOperationKey(
            UUID userId, String operationType, String operationKey);

    /**
     * Finds an existing committed mutation record with a pessimistic read lock.
     * Must be called inside a PESSIMISTIC_WRITE user transaction to guarantee no concurrent insert
     * slips between the check and the subsequent save.
     */
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT r FROM ResourceMutationLedgerEntity r " +
           "WHERE r.user.id = :userId AND r.operationType = :type AND r.operationKey = :key")
    Optional<ResourceMutationLedgerEntity> findLockedByUserAndTypeAndKey(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("key") String key);
}
