package com.worldhero.repository;

import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.enums.HeroClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HeroRepository extends JpaRepository<HeroEntity, UUID> {

    List<HeroEntity> findByUserId(UUID userId);

    List<HeroEntity> findByUserIdAndIsInPartyTrueOrderBySlotIndexAsc(UUID userId);

    Optional<HeroEntity> findByUserIdAndHeroClass(UUID userId, HeroClass heroClass);

    @Query("SELECT h FROM HeroEntity h LEFT JOIN FETCH h.equippedItems WHERE h.user.id = :userId")
    List<HeroEntity> findAllByUserIdWithEquippedItems(@Param("userId") UUID userId);
}
