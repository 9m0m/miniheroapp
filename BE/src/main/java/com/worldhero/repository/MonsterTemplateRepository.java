package com.worldhero.repository;

import com.worldhero.model.entity.MonsterTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonsterTemplateRepository extends JpaRepository<MonsterTemplateEntity, String> {
    List<MonsterTemplateEntity> findByCategory(String category);
    List<MonsterTemplateEntity> findByIsBoss(Boolean isBoss);
}
