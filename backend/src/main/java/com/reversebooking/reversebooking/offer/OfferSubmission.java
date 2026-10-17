package com.reversebooking.reversebooking.offer;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OfferSubmission(
        @NotBlank String airlineId,
        @NotNull @Min(1) Integer pricePence,
        @NotNull @Min(0) Integer checkedBags,
        boolean direct
) {
}
