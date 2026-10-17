package com.reversebooking.reversebooking.offer;

import com.reversebooking.reversebooking.request.FlightRequest;
import com.reversebooking.reversebooking.request.FlightRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class OfferService {
    private final FlightRequestService flightRequestService;

    private final List<Offer> offers = new ArrayList<>();

    public OfferService(FlightRequestService flightRequestService) {
        this.flightRequestService = flightRequestService;
    }

    public Offer add(Offer offer) {
        FlightRequest correspondingRequest = flightRequestService.findById(offer.requestId());
        if (correspondingRequest == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
        if (correspondingRequest.maxBudget().compareTo(offer.price()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Offer price exceeds request budget");
        }
        offers.add(offer);
        return offer;
    }

    public List<Offer> getForRequest(Long requestId) {
        return offers.stream()
                .filter(offer -> offer.requestId().equals(requestId))
                .toList();
    }
}
