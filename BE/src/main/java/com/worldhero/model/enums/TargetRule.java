package com.worldhero.model.enums;

public enum TargetRule {
    // Legacy compatibility
    FRONT_ENEMY,

    // Core Game v2 Declarative Patterns
    EXPOSED_SINGLE,
    LOWEST_HP_ALLY,
    SELF,
    FRONTMOST_ANY_COLUMN,
    BACKMOST_ENEMY,
    SAME_COLUMN,
    FULL_ROW,
    ALL_ENEMIES,
    ALL_ALLIES,
    CROSS,
    ADJACENT,
    LOWEST_HP_ENEMY,
    HIGHEST_ATK_ENEMY
}
