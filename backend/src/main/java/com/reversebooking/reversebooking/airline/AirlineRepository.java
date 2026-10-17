package com.reversebooking.reversebooking.airline;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class AirlineRepository {
    private final List<Airline> airlines = new ArrayList<>(List.of(
            new Airline("aeronova", "AeroNova", "AN", "Full-service carrier", "#4338ca", List.of(), new Strategy(true, "PREMIUM")),
            new Airline("budgetjet", "BudgetJet", "BJ", "Low-cost carrier", "#ea580c", List.of(), new Strategy(true, "AGGRESSIVE")),
            new Airline("skyways", "SkyWays", "SW", "Hybrid carrier", "#0891b2", List.of(), new Strategy(false, "BALANCED"))
    ));

    public List<Airline> findAll() {
        return List.copyOf(airlines);
    }

    public Airline findById(String id) {
        return airlines.stream().filter(airline -> airline.id().equals(id)).findFirst().orElse(null);
    }

    public Airline updateStrategy(String id, Strategy strategy) {
        for (int i = 0; i < airlines.size(); i++) {
            if (airlines.get(i).id().equals(id)) {
                Airline current = airlines.get(i);
                Airline updated = new Airline(current.id(), current.name(), current.code(), current.tagline(),
                        current.colour(), current.minFares(), strategy);
                airlines.set(i, updated);
                return updated;
            }
        }
        return null;
    }
}
