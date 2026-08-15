package com.worldhero.repository;

import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemTemplateRepository extends JpaRepository<ItemTemplateEntity, String> {

    List<ItemTemplateEntity> findByRequiredClassOrRequiredClassIsNull(HeroClass requiredClass);

    List<ItemTemplateEntity> findBySlotType(ItemSlot slotType);
}
