package com.reversebooking.reversebooking.offer;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OfferService {
    private final List<Offer> offers = new ArrayList<>();

    public Offer add(Offer offer) {
        offers.add(offer);
        return offer;
    }

    public List<Offer> getForRequest(Long requestId) {
        return offers.stream()
                .filter(offer -> offer.requestId().equals(requestId))
                .toList();
    }
}
