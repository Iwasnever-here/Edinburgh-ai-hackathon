package com.reversebooking.reversebooking.airline;

import java.util.List;

public record Airline(
        Long id,
        String name,
        List<RouteFare> routes
) {
}
