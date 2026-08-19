package com.worldhero.service;

import com.worldhero.dto.TowerFloorDto;

import java.util.List;
import java.util.Optional;

public interface TowerFloorConfigService {
    int TOTAL_FLOORS = 30;

    List<TowerFloorDto> getAllFloors();

    Optional<TowerFloorDto> getFloorByNumber(int floorNumber);

    boolean validateAllFloors();
}
