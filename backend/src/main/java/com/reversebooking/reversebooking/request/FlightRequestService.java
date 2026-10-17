package com.reversebooking.reversebooking.request;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class FlightRequestService {
    private final List<FlightRequest> requests = new ArrayList<>();

    public FlightRequest add(FlightRequest request) {
        if (request.latest().isBefore(request.earliest())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latest travel date cannot be before earliest travel date");
        }
        if (request.origin().trim().equalsIgnoreCase(request.destination().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Origin and destination must differ");
        }

        FlightRequest savedRequest = new FlightRequest(
                UUID.randomUUID().toString(),
                request.origin().trim(),
                request.destination().trim(),
                request.earliest(),
                request.latest(),
                request.passengers(),
                request.maxPricePence(),
                request.checkedBags(),
                request.directOnly(),
                Instant.now().plus(10, ChronoUnit.MINUTES),
                0
        );
        requests.add(savedRequest);
        return savedRequest;
    }

    public List<FlightRequest> getAll() {
        return List.copyOf(requests);
    }

    public List<FlightRequest> getOpenMarketplace() {
        Instant now = Instant.now();
        return requests.stream()
                .filter(request -> request.biddingClosesAt().isAfter(now))
                .sorted(Comparator.comparing(FlightRequest::biddingClosesAt))
                .toList();
    }

    public boolean existsById(String id) {
        return findById(id) != null;
    }

    public FlightRequest findById(String id) {
        return requests.stream().filter(request -> request.id().equals(id)).findFirst().orElse(null);
    }

    public void updateBidCount(String requestId, int bidCount) {
        for (int i = 0; i < requests.size(); i++) {
            FlightRequest current = requests.get(i);
            if (current.id().equals(requestId)) {
                requests.set(i, new FlightRequest(
                        current.id(), current.origin(), current.destination(), current.earliest(), current.latest(),
                        current.passengers(), current.maxPricePence(), current.checkedBags(), current.directOnly(),
                        current.biddingClosesAt(), bidCount
                ));
                return;
            }
        }
    }
}
