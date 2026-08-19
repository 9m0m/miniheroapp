package com.worldhero.controller;

import com.worldhero.dto.*;
import com.worldhero.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "LiveOps Admin CMS API", description = "Trung tâm quản trị sàn đấu, quái vật, cân bằng vật phẩm & kỹ năng")
public class AdminController {

    private final AdminService adminService;

    // ==========================================
    // 📊 DASHBOARD OVERVIEW
    // ==========================================

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Lấy dữ liệu thống kê tổng quan hệ thống LiveOps")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==========================================
    // 🛡️ MASTER ITEM TEMPLATES BALANCER
    // ==========================================

    @GetMapping("/item-templates")
    @Operation(summary = "Lấy danh sách 30+ Master Item Templates kèm chỉ số gốc")
    public ResponseEntity<List<ItemTemplateDto>> getAllItemTemplates() {
        return ResponseEntity.ok(adminService.getAllItemTemplates());
    }

    @PutMapping("/item-templates/{id}")
    @Operation(summary = "Cập nhật chỉ số gốc và hệ số iLvl của Master Item")
    public ResponseEntity<ItemTemplateDto> updateItemTemplate(
            @PathVariable String id,
            @RequestBody ItemTemplateDto dto) {
        return ResponseEntity.ok(adminService.updateItemTemplate(id, dto));
    }

    // ==========================================
    // 🔮 HERO & SKILL TREE BALANCER
    // ==========================================

    @GetMapping("/skills")
    @Operation(summary = "Lấy danh sách cấu hình Cây Kỹ Năng của 4 Class")
    public ResponseEntity<List<SkillConfigDto>> getAllSkillConfigs() {
        return ResponseEntity.ok(adminService.getAllSkillConfigs());
    }

    @PutMapping("/skills/{skillId}")
    @Operation(summary = "Cập nhật chi phí Gold và % chỉ số thưởng của nút Kỹ Năng")
    public ResponseEntity<SkillConfigDto> updateSkillConfig(
            @PathVariable String skillId,
            @RequestBody SkillConfigDto dto) {
        return ResponseEntity.ok(adminService.updateSkillConfig(skillId, dto));
    }

    // ==========================================
    // 🏰 PROGRESS TOWER BALANCE VALIDATION
    // ==========================================

    private final com.worldhero.service.TowerFloorConfigService towerFloorConfigService;

    @GetMapping("/tower/validate")
    @Operation(summary = "Dry-run kiểm tra tính toàn vẹn và cân bằng của 30 Floor Tower")
    public ResponseEntity<java.util.Map<String, Object>> validateTowerFloors() {
        boolean valid = towerFloorConfigService.validateAllFloors();
        return ResponseEntity.ok(java.util.Map.of(
                "valid", valid,
                "totalFloors", com.worldhero.service.TowerFloorConfigService.TOTAL_FLOORS,
                "floors", towerFloorConfigService.getAllFloors().size(),
                "status", "ALL_FLOORS_VALIDATED"
        ));
    }
}
