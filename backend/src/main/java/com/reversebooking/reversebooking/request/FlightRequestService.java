package com.reversebooking.reversebooking.request;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class FlightRequestService {
    private final List<FlightRequest> requests = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    public FlightRequest add(FlightRequest request) {
        // Arrival date must be after departure date
        if (request.arrivalDate() != null && !request.arrivalDate().isAfter(request.departureDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arrival date cannot be before departure date");
        }

        // Origin and destination differ within the same request
        if (request.origin().trim().equalsIgnoreCase(request.destination().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Origin and destination must differ");
        }

        FlightRequest savedRequest = new FlightRequest(
                nextId.getAndIncrement(),
                request.origin(),
                request.destination(),
                request.departureDate(),
                request.arrivalDate(),
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

    public FlightRequest findById(Long id) {
        return requests.stream().filter(request -> request.id().equals(id)).findFirst().orElse(null);
    }
}
