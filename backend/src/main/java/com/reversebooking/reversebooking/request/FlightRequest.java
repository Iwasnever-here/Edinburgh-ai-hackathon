package com.reversebooking.reversebooking.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FlightRequest(
    @JsonProperty(access = JsonProperty.Access.READ_ONLY) Long id,
    @NotBlank String origin,
    @NotBlank String destination,
    LocalDate departureDate,
    @NotNull @DecimalMin("0.01")
    BigDecimal maxBudget
) {}
