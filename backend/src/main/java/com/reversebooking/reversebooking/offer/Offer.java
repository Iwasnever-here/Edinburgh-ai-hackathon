package com.reversebooking.reversebooking.offer;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record Offer(
    Long id,
    @NotNull Long requestId,
    @NotNull Long airlineId,
    @NotNull @DecimalMin("0.01") BigDecimal price,
    boolean accepted
) {
}
