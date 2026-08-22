package com.worldhero.repository;

import com.worldhero.model.entity.SkillConfigEntity;
import com.worldhero.model.enums.HeroClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillConfigRepository extends JpaRepository<SkillConfigEntity, String> {
    List<SkillConfigEntity> findByHeroClass(HeroClass heroClass);
    Optional<SkillConfigEntity> findBySkillId(String skillId);
}
