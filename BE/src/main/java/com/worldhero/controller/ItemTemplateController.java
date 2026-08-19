package com.worldhero.controller;

import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.service.ItemTemplateCacheService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/item-templates")
@RequiredArgsConstructor
@Tag(name = "Item Templates", description = "Danh mục trang bị chuẩn từ Server Backend")
public class ItemTemplateController {

    private final ItemTemplateCacheService itemTemplateCacheService;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh mục Item Templates từ Database để nạp vào Client")
    public ResponseEntity<List<ItemTemplateDto>> getAllItemTemplates() {
        List<ItemTemplateDto> list = itemTemplateCacheService.getAllTemplates().stream()
                .map(ItemTemplateEntity::toTemplateDto)
                .toList();
        return ResponseEntity.ok(list);
    }
}
