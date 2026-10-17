package com.reversebooking.reversebooking.airline;

import java.math.BigDecimal;

public record RouteFare(
        String origin,
        String destination,
        BigDecimal minimumFare
) {
}
