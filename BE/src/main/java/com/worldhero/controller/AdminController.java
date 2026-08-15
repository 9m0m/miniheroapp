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
    // 👾 MONSTER TEMPLATES
    // ==========================================

    @GetMapping("/monsters")
    @Operation(summary = "Lấy toàn bộ danh sách Master Quái vật")
    public ResponseEntity<List<MonsterTemplateDto>> getAllMonsters() {
        return ResponseEntity.ok(adminService.getAllMonsters());
    }

    @GetMapping("/monsters/{id}")
    @Operation(summary = "Lấy thông tin chi tiết một Quái vật theo ID")
    public ResponseEntity<MonsterTemplateDto> getMonsterById(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getMonsterById(id));
    }

    @PostMapping("/monsters")
    @Operation(summary = "Tạo Quái vật mới")
    public ResponseEntity<MonsterTemplateDto> createMonster(@RequestBody MonsterTemplateDto dto) {
        return ResponseEntity.ok(adminService.createMonster(dto));
    }

    @PutMapping("/monsters/{id}")
    @Operation(summary = "Cập nhật chỉ số Quái vật")
    public ResponseEntity<MonsterTemplateDto> updateMonster(@PathVariable String id, @RequestBody MonsterTemplateDto dto) {
        return ResponseEntity.ok(adminService.updateMonster(id, dto));
    }

    @DeleteMapping("/monsters/{id}")
    @Operation(summary = "Xóa Quái vật khỏi hệ thống")
    public ResponseEntity<Void> deleteMonster(@PathVariable String id) {
        adminService.deleteMonster(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // ⚔️ STAGE & WAVE LIVE BALANCING
    // ==========================================

    @GetMapping("/stages/{world}/{stage}")
    @Operation(summary = "Lấy cấu hình 30 Wave và Drop Table của một Stage")
    public ResponseEntity<StageDetailConfigDto> getStageDetailConfig(
            @PathVariable int world,
            @PathVariable int stage) {
        return ResponseEntity.ok(adminService.getStageDetailConfig(world, stage));
    }

    @PutMapping("/stages/{world}/{stage}")
    @Operation(summary = "Lưu cấu hình 30 Wave & Drop Table của Stage vào Database")
    public ResponseEntity<StageDetailConfigDto> updateStageDetailConfig(
            @PathVariable int world,
            @PathVariable int stage,
            @RequestBody StageDetailConfigDto dto) {
        return ResponseEntity.ok(adminService.updateStageDetailConfig(world, stage, dto));
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
    // 🎯 LIVE BATTLE SIMULATION
    // ==========================================

    @PostMapping("/simulate-battle")
    @Operation(summary = "Chạy mô phỏng 100 trận đấu giả lập giữa Party và Quái vật")
    public ResponseEntity<BattleSimulationResultDto> simulateBattle(@RequestBody BattleSimulationRequestDto request) {
        return ResponseEntity.ok(adminService.simulateBattle(request));
    }
}
