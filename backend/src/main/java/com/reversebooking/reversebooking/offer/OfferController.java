package com.reversebooking.reversebooking.offer;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OfferController {
    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping("/requests/{requestId}/offers")
    public Offer create(@PathVariable String requestId, @Valid @RequestBody OfferSubmission offer) {
        return offerService.add(requestId, offer);
    }

    @GetMapping("/requests/{requestId}/offers")
    public List<Offer> getForRequest(@PathVariable String requestId) {
        return offerService.getForRequest(requestId);
    }

    @GetMapping("/requests/{requestId}/standing")
    public Standing getStanding(@PathVariable String requestId, @RequestParam String airlineId) {
        return offerService.getStanding(requestId, airlineId);
    }

    @PostMapping("/offers/{offerId}/accept")
    public Offer accept(@PathVariable String offerId) {
        return offerService.acceptOffer(offerId);
    }
}
