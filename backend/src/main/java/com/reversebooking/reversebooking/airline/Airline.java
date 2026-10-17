package com.reversebooking.reversebooking.airline;

import java.util.List;
import java.util.Map;

public record Airline(
        String id,
        String name,
        String code,
        String tagline,
        String colour,
        List<Map<String, Object>> minFares,
        Strategy strategy
) {
}
