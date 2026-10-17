package com.reversebooking.reversebooking.offer;

import com.reversebooking.reversebooking.airline.AirlineSummary;

import java.time.Instant;

public record Offer(
        String id,
        String requestId,
        String airlineId,
        int pricePence,
        int checkedBags,
        boolean direct,
        OfferStatus status,
        String reasoning,
        Instant createdAt,
        String rejectionReason,
        String supersedesOfferId,
        ScoreBreakdown scoreBreakdown,
        AirlineSummary airline
) {
}
