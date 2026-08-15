package com.worldhero.controller;

import com.worldhero.dto.HeroDetailDto;
import com.worldhero.service.HeroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/heroes")
@RequiredArgsConstructor
@Tag(name = "Heroes & Party", description = "Quản lý 4 Class Tướng, trang bị đang mặc và Live DPS thời gian thực")
public class HeroController {

    private final HeroService heroService;

    @GetMapping
    @Operation(summary = "Lấy danh sách 4 Tướng kèm trang bị đang mặc và chỉ số stats tính động")
    public ResponseEntity<List<HeroDetailDto>> getHeroes(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(heroService.getHeroesForUser(userId));
    }
}
