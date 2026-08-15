package com.worldhero.controller;

import com.worldhero.dto.QuestOverviewResponseDto;
import com.worldhero.model.enums.QuestType;
import com.worldhero.service.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuestController {

    private final QuestService questService;

    @GetMapping("/overview")
    public ResponseEntity<QuestOverviewResponseDto> getQuestOverview(@RequestParam UUID userId) {
        return ResponseEntity.ok(questService.getQuestOverview(userId));
    }

    @PostMapping("/claim")
    public ResponseEntity<QuestOverviewResponseDto> claimQuestReward(
            @RequestParam UUID userId,
            @RequestParam String questId
    ) {
        return ResponseEntity.ok(questService.claimQuestReward(userId, questId));
    }

    @PostMapping("/milestones/claim")
    public ResponseEntity<QuestOverviewResponseDto> claimMilestoneReward(
            @RequestParam UUID userId,
            @RequestParam QuestType questType,
            @RequestParam int milestoneIndex
    ) {
        return ResponseEntity.ok(questService.claimMilestoneReward(userId, questType, milestoneIndex));
    }
}
