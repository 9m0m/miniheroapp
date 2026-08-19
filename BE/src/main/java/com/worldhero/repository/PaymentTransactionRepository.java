package com.worldhero.repository;

import com.worldhero.model.entity.PaymentTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransactionEntity, UUID> {

    Optional<PaymentTransactionEntity> findByReference(String reference);

    boolean existsByReference(String reference);

    Optional<PaymentTransactionEntity> findByTransactionId(String transactionId);

    boolean existsByTransactionId(String transactionId);
}
