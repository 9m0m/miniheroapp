package com.worldhero.engine.tower;

import java.util.ArrayList;
import java.util.List;

public class InitiativeResolver {

    /**
     * Snapshots immutable initiative turn order for living entities at the start of round R.
     * Canonical tie-breaking:
     * 1. Effective Speed descending
     * 2. Side priority: PLAYER first
     * 3. Grid Row priority: FRONT (0) -> MID (1) -> BACK (2)
     * 4. Grid Col priority: LEFT (0) -> CENTER (1) -> RIGHT (2)
     * 5. Entity ID ascending
     */
    public static List<TowerEntity> resolveInitiative(List<TowerEntity> combatants, int roundNumber) {
        List<TowerEntity> living = new ArrayList<>(combatants.stream().filter(e -> !e.isDowned()).toList());

        living.sort((e1, e2) -> {
            // 1. Effective Speed descending
            int speed1 = e1.getEffectiveSpeed();
            int speed2 = e2.getEffectiveSpeed();
            if (speed1 != speed2) {
                return Integer.compare(speed2, speed1);
            }

            // 2. Side priority: Odd round -> PLAYER first, Even round -> ENEMY first
            if (e1.getSide() != e2.getSide()) {
                boolean playerPriority = (roundNumber % 2 == 1);
                return playerPriority
                        ? (e1.getSide() == TowerSide.PLAYER ? -1 : 1)
                        : (e1.getSide() == TowerSide.ENEMY ? -1 : 1);
            }

            // 3. Grid Row priority: FRONT -> MID -> BACK
            int row1 = e1.getGridRow() != null ? e1.getGridRow().ordinal() : 0;
            int row2 = e2.getGridRow() != null ? e2.getGridRow().ordinal() : 0;
            if (row1 != row2) {
                return Integer.compare(row1, row2);
            }

            // 4. Grid Col priority: LEFT -> CENTER -> RIGHT
            int col1 = e1.getGridCol() != null ? e1.getGridCol().ordinal() : 1;
            int col2 = e2.getGridCol() != null ? e2.getGridCol().ordinal() : 1;
            if (col1 != col2) {
                return Integer.compare(col1, col2);
            }

            // 5. Entity ID ascending
            return e1.getEntityId().compareTo(e2.getEntityId());
        });

        return living;
    }
}
