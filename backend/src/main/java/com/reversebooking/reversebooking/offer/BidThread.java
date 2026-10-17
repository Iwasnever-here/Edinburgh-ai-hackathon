package com.reversebooking.reversebooking.offer;

import com.reversebooking.reversebooking.request.FlightRequest;

import java.util.List;

public record BidThread(FlightRequest request, List<Offer> offers) {
}
