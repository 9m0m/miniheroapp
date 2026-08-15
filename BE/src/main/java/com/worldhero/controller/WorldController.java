package com.worldhero.controller;

import com.worldhero.dto.WorldConfigDto;
import com.worldhero.service.WorldService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/worlds")
@RequiredArgsConstructor
@Tag(name = "World & Progression API", description = "Thông tin 4 Thế Giới và 40 Stages Boss")
public class WorldController {

    private final WorldService worldService;

    @GetMapping
    @Operation(summary = "Lấy danh sách 4 Thế Giới và đặc tính nguyên tố / Boss")
    public ResponseEntity<List<WorldConfigDto>> getAllWorlds() {
        return ResponseEntity.ok(worldService.getAllWorlds());
    }
}
