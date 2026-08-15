package com.worldhero.service;

import com.worldhero.dto.BlessRequestDto;
import com.worldhero.dto.CraftRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.SocketOperationRequestDto;

public interface CraftingService {
    ItemInstanceDto inlayGem(SocketOperationRequestDto request);
    ItemInstanceDto removeGem(SocketOperationRequestDto request);
    ItemInstanceDto blessItem(BlessRequestDto request);
    ItemInstanceDto craftAccessory(CraftRequestDto request);
    String brewAlchemy(CraftRequestDto request);
}
