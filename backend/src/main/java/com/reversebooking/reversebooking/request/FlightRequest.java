package com.reversebooking.reversebooking.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.Instant;
import java.time.LocalDate;

public record FlightRequest(
        @JsonProperty(access = JsonProperty.Access.READ_ONLY) String id,
        @NotBlank String origin,
        @NotBlank String destination,
        @NotNull @FutureOrPresent LocalDate earliest,
        @NotNull @FutureOrPresent LocalDate latest,
        @NotNull @Min(1) Integer passengers,
        @NotNull @Positive Integer maxPricePence,
        @NotNull @Min(0) Integer checkedBags,
        boolean directOnly,
        @JsonProperty(access = JsonProperty.Access.READ_ONLY) Instant biddingClosesAt,
        @JsonProperty(access = JsonProperty.Access.READ_ONLY) Integer bidCount
) {
}
