package com.worldhero.controller;

import com.worldhero.dto.HeroCatalogResponseDto;
import com.worldhero.dto.HeroTemplateDto;
import com.worldhero.service.HeroCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hero-catalog")
@RequiredArgsConstructor
@Tag(name = "Hero Catalog", description = "Danh mục 24 Hero Templates, 6 Roles và Profile chiến đấu")
public class HeroCatalogController {

    private final HeroCatalogService heroCatalogService;

    @GetMapping
    @Operation(summary = "Lấy danh mục Hero Catalog (24 templates, 18 enabled)")
    public ResponseEntity<HeroCatalogResponseDto> getCatalog(
            @RequestParam(required = false, defaultValue = "current") String version
    ) {
        return ResponseEntity.ok(heroCatalogService.getCatalog(version));
    }

    @GetMapping("/{templateId}")
    @Operation(summary = "Lấy chi tiết Hero Template theo ID")
    public ResponseEntity<HeroTemplateDto> getTemplateById(@PathVariable String templateId) {
        return heroCatalogService.getTemplateById(templateId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/enabled")
    @Operation(summary = "Lấy danh sách 18 Hero Templates đang mở khóa cho MVP")
    public ResponseEntity<List<HeroTemplateDto>> getEnabledTemplates() {
        return ResponseEntity.ok(heroCatalogService.getEnabledTemplates());
    }
}
