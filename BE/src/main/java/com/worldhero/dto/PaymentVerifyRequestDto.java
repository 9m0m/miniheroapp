package com.worldhero.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerifyRequestDto {

    private UUID userId;

    @NotBlank(message = "reference is required")
    @JsonProperty("reference")
    private String reference;

    @JsonProperty("transaction_id")
    private String transactionId;

    @NotBlank(message = "feature_key is required")
    @JsonProperty("feature_key")
    private String featureKey; // "GOLDEN_PASS", "SMASH_PIGGY_BANK"

    @JsonProperty("amount_wld")
    private BigDecimal amountWld;
}
