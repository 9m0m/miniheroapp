package com.worldhero.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorldIdVerifyRequestDto {

    @NotBlank(message = "nullifier_hash is required")
    @JsonProperty("nullifier_hash")
    private String nullifierHash;

    @JsonProperty("merkle_root")
    private String merkleRoot;

    @JsonProperty("proof")
    private String proof;

    @JsonProperty("verification_level")
    @Builder.Default
    private String verificationLevel = "orb"; // "orb" or "device"

    @JsonProperty("action")
    @Builder.Default
    private String action = "world-hero-login";

    @JsonProperty("signal")
    private String signal;

    @JsonProperty("display_name")
    private String displayName;
}
