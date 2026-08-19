package com.worldhero.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
@Tag(name = "Feature Configuration", description = "Server-authoritative feature flags and environment boundaries")
public class FeatureConfigController {

    @Value("${core.v2.enabled:true}")
    private boolean coreV2Enabled;

    @Value("${tower.v2.enabled:true}")
    private boolean towerV2Enabled;

    @Value("${recruitment.paid.enabled:false}")
    private boolean paidRecruitmentEnabled;

    @Value("${expedition.paid-slots.enabled:false}")
    private boolean paidExpeditionSlotsEnabled;

    @GetMapping("/features")
    @Operation(summary = "Lấy danh sách các Feature Flag đang kích hoạt trên máy chủ")
    public ResponseEntity<Map<String, Object>> getFeatureFlags() {
        Map<String, Object> flags = new LinkedHashMap<>();
        flags.put("coreV2Enabled", coreV2Enabled);
        flags.put("towerV2Enabled", towerV2Enabled);
        flags.put("paidRecruitmentEnabled", paidRecruitmentEnabled);
        flags.put("paidExpeditionSlotsEnabled", paidExpeditionSlotsEnabled);
        flags.put("catalogVersion", "hero-v1");
        flags.put("balanceVersion", "tower-v1");
        return ResponseEntity.ok(flags);
    }
}
