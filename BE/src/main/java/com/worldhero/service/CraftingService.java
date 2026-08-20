package com.worldhero.service;

import com.worldhero.dto.BlessRequestDto;
import com.worldhero.dto.CraftRequestDto;
import com.worldhero.dto.ItemInstanceDto;

public interface CraftingService {
    ItemInstanceDto blessItem(BlessRequestDto request);
    ItemInstanceDto craftAccessory(CraftRequestDto request);
    String brewAlchemy(CraftRequestDto request);
}
