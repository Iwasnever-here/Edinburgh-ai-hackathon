package com.reversebooking.reversebooking.offer;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record Offer(
    @NotNull Long requestId,
    @NotBlank String providerName,
    @NotNull @DecimalMin("0.01") BigDecimal price
) {
}
