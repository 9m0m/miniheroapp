package com.worldhero.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocketOperationRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "itemInstanceId is required")
    private UUID itemInstanceId;

    private String gemId; // e.g. "RUBY_T2", "EMERALD_T3" (for inlay or remove)
    private int socketIndex; // Index in sockets array
}
