package com.worldhero.controller;

import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.HeroSkillTreeDto;
import com.worldhero.dto.UpgradeSkillRequestDto;
import com.worldhero.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/heroes")
@RequiredArgsConstructor
@Tag(name = "Skill Tree API", description = "Quản lý Cây Kỹ Năng 4 Class tiêu Gold")
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/{heroId}/skills")
    @Operation(summary = "Lấy cây kỹ năng của 1 Tướng")
    public ResponseEntity<HeroSkillTreeDto> getSkillTree(@PathVariable UUID heroId) {
        return ResponseEntity.ok(skillService.getSkillTree(heroId));
    }

    @PostMapping("/skills/upgrade")
    @Operation(summary = "Nâng cấp 1 nhánh kỹ năng trong Skill Tree tiêu Gold")
    public ResponseEntity<HeroDetailDto> upgradeSkill(@Valid @RequestBody UpgradeSkillRequestDto request) {
        return ResponseEntity.ok(skillService.upgradeSkill(request));
    }
}
