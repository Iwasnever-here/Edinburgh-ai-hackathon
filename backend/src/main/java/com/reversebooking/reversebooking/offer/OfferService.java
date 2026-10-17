package com.reversebooking.reversebooking.offer;

import com.reversebooking.reversebooking.request.FlightRequest;
import com.reversebooking.reversebooking.request.FlightRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OfferService {
    private final FlightRequestService flightRequestService;

    private final List<Offer> offers = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    public OfferService(FlightRequestService flightRequestService) {
        this.flightRequestService = flightRequestService;
    }

    public Offer add(Offer offer) {
        FlightRequest correspondingRequest = flightRequestService.findById(offer.requestId());
        // Corresponding request exists
        if (correspondingRequest == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
        // Offer price exceeds request budget
        if (correspondingRequest.maxBudget().compareTo(offer.price()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Offer price exceeds request budget");
        }

        // Remove old bid price for this airline on this request
        offers.removeIf(o -> Objects.equals(o.airlineId(), offer.airlineId()) &&
                Objects.equals(o.requestId(), offer.requestId()));

        Offer savedOffer = new Offer(
            nextId.getAndIncrement(),
            offer.requestId(),
            offer.airlineId(),
            offer.price(),
            false);
        offers.add(savedOffer);
        return savedOffer;
    }

    public Offer acceptOffer(Long offerId) {
        for (int i = 0; i < offers.size(); i++) {
            Offer current = offers.get(i);

            if (Objects.equals(current.id(), offerId)) {
                if (current.accepted()) {
                    return current;
                }

                boolean anotherOfferAccepted = offers.stream()
                        .anyMatch(offer ->
                                offer.requestId().equals(current.requestId())
                                        && offer.accepted());

                if (anotherOfferAccepted) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Another offer for this request has already been accepted"
                    );
                }

                Offer acceptedOffer = new Offer(
                        current.id(),
                        current.requestId(),
                        current.airlineId(),
                        current.price(),
                        true
                );

                offers.set(i, acceptedOffer);
                return acceptedOffer;
            }
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found");
    }

    public List<Offer> getForRequest(Long requestId) {
        return offers.stream()
            .filter(offer -> offer.requestId().equals(requestId))
            .toList();
    }
}
