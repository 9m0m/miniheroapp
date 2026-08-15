package com.worldhero.controller;

import com.worldhero.model.entity.QuestTemplateEntity;
import com.worldhero.service.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/quests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminQuestController {

    private final QuestService questService;

    @GetMapping
    public ResponseEntity<List<QuestTemplateEntity>> getAllQuestTemplates() {
        return ResponseEntity.ok(questService.getAllQuestTemplates());
    }

    @PostMapping
    public ResponseEntity<QuestTemplateEntity> createQuestTemplate(@RequestBody QuestTemplateEntity template) {
        return ResponseEntity.ok(questService.createQuestTemplate(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestTemplateEntity> updateQuestTemplate(
            @PathVariable String id,
            @RequestBody QuestTemplateEntity template
    ) {
        return ResponseEntity.ok(questService.updateQuestTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestTemplate(@PathVariable String id) {
        questService.deleteQuestTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
