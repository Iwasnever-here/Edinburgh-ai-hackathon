package com.reversebooking.reversebooking.request;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class FlightRequestService {
    private final List<FlightRequest> requests = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    public FlightRequest add(FlightRequest request) {
        FlightRequest savedRequest = new FlightRequest(
                nextId.getAndIncrement(),
                request.origin(),
                request.destination(),
                request.departureDate(),
                request.maxBudget()
        );
        requests.add(savedRequest);
        return savedRequest;
    }

    public List<FlightRequest> getAll() {
        return List.copyOf(requests);
    }

    public boolean existsById(Long id) {
        return requests.stream().anyMatch(request -> request.id().equals(id));
    }
}
