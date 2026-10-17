package com.reversebooking.reversebooking.offer;

import com.reversebooking.reversebooking.request.FlightRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class OfferController {
    private final OfferService offerService;
    private final FlightRequestService flightRequestService;

    public OfferController(OfferService offerService, FlightRequestService flightRequestService) {
        this.offerService = offerService;
        this.flightRequestService = flightRequestService;
    }

    @PostMapping("/api/offers")
    public Offer create(@Valid @RequestBody Offer offer) {
        if (!flightRequestService.existsById(offer.requestId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Flight request not found");
        }
        return offerService.add(offer);
    }

    @GetMapping("/api/requests/{requestId}/offers")
    public List<Offer> getForRequest(@PathVariable Long requestId) {
        if (!flightRequestService.existsById(requestId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Flight request not found");
        }
        return offerService.getForRequest(requestId);
    }
}
