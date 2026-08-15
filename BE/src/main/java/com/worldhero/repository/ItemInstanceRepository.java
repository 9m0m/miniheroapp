package com.worldhero.repository;

import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.enums.ItemSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemInstanceRepository extends JpaRepository<ItemInstanceEntity, UUID> {

    List<ItemInstanceEntity> findByUserId(UUID userId);

    List<ItemInstanceEntity> findByUserIdAndHeroIsNull(UUID userId); // Bag items

    List<ItemInstanceEntity> findByHeroId(UUID heroId); // Hero equipped items

    Optional<ItemInstanceEntity> findByHeroIdAndEquippedSlot(UUID heroId, ItemSlot equippedSlot);

    @Query("SELECT i FROM ItemInstanceEntity i JOIN FETCH i.template WHERE i.user.id = :userId AND i.hero IS NULL")
    List<ItemInstanceEntity> findBagItemsWithTemplateByUserId(@Param("userId") UUID userId);

    @Query("SELECT i FROM ItemInstanceEntity i JOIN FETCH i.template WHERE i.hero.id = :heroId")
    List<ItemInstanceEntity> findEquippedItemsWithTemplateByHeroId(@Param("heroId") UUID heroId);
}
