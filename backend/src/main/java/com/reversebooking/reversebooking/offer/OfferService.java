package com.reversebooking.reversebooking.offer;

import com.reversebooking.reversebooking.airline.Airline;
import com.reversebooking.reversebooking.airline.AirlineRepository;
import com.reversebooking.reversebooking.airline.AirlineSummary;
import com.reversebooking.reversebooking.request.FlightRequest;
import com.reversebooking.reversebooking.request.FlightRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OfferService {
    private static final Map<String, Double> SCORE_WEIGHTS = Map.of(
            "Price", 0.6,
            "Baggage", 0.2,
            "Direct", 0.2
    );

    private final FlightRequestService flightRequestService;
    private final AirlineRepository airlineRepository;
    private final List<Offer> offers = new ArrayList<>();

    public OfferService(FlightRequestService flightRequestService, AirlineRepository airlineRepository) {
        this.flightRequestService = flightRequestService;
        this.airlineRepository = airlineRepository;
    }

    public Offer add(String requestId, OfferSubmission submission) {
        FlightRequest request = flightRequestService.findById(requestId);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
        Airline airline = airlineRepository.findById(submission.airlineId());
        if (airline == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Airline not found");
        }
        if (!request.biddingClosesAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bidding on this request has closed");
        }

        String rejectionReason = validate(request, submission);
        OfferStatus status = rejectionReason == null ? OfferStatus.VALID : OfferStatus.REJECTED;
        Offer previous = null;
        if (status == OfferStatus.VALID) {
            for (int i = 0; i < offers.size(); i++) {
                Offer existing = offers.get(i);
                if (existing.requestId().equals(requestId)
                        && existing.airlineId().equals(submission.airlineId())
                        && existing.status() == OfferStatus.VALID) {
                    previous = existing;
                    offers.set(i, withStatus(existing, OfferStatus.SUPERSEDED));
                }
            }
        }

        Offer saved = new Offer(
                UUID.randomUUID().toString(),
                requestId,
                submission.airlineId(),
                submission.pricePence(),
                submission.checkedBags(),
                submission.direct(),
                status,
                "Placed manually from the airline portal.",
                Instant.now(),
                rejectionReason,
                previous == null ? null : previous.id(),
                null,
                summary(airline)
        );
        offers.add(saved);
        refreshBidCount(requestId);
        return saved;
    }

    public Offer acceptOffer(String offerId) {
        for (int i = 0; i < offers.size(); i++) {
            Offer current = offers.get(i);
            if (!current.id().equals(offerId)) continue;
            if (current.status() == OfferStatus.ACCEPTED) return current;
            if (current.status() != OfferStatus.VALID) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Only a valid offer can be accepted");
            }
            if (offers.stream().anyMatch(offer -> offer.requestId().equals(current.requestId())
                    && offer.status() == OfferStatus.ACCEPTED)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Another offer for this request has already been accepted");
            }

            Offer accepted = withStatus(current, OfferStatus.ACCEPTED);
            offers.set(i, accepted);
            for (int j = 0; j < offers.size(); j++) {
                Offer other = offers.get(j);
                if (other.requestId().equals(current.requestId()) && other.status() == OfferStatus.VALID) {
                    offers.set(j, withStatus(other, OfferStatus.LOST));
                }
            }
            refreshBidCount(current.requestId());
            return accepted;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found");
    }

    public List<Offer> getForRequest(String requestId) {
        if (!flightRequestService.existsById(requestId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
        FlightRequest request = flightRequestService.findById(requestId);
        return offers.stream()
                .filter(offer -> offer.requestId().equals(requestId))
                .sorted(Comparator.comparing(Offer::createdAt))
                .map(offer -> withScore(request, offer))
                .toList();
    }

    public Standing getStanding(String requestId, String airlineId) {
        FlightRequest request = flightRequestService.findById(requestId);
        if (request == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        List<Offer> active = offers.stream().filter(offer -> offer.requestId().equals(requestId)
                && offer.status() == OfferStatus.VALID).toList();
        Offer mine = active.stream().filter(offer -> offer.airlineId().equals(airlineId)).findFirst().orElse(null);
        if (mine == null) return null;

        int rank = 1 + (int) active.stream().filter(offer -> offer.pricePence() < mine.pricePence()).count();
        List<Offer> rivals = active.stream().filter(offer -> !offer.airlineId().equals(airlineId)).toList();
        List<String> strengths = new ArrayList<>();
        if (rank == 1) strengths.add(rivals.isEmpty() ? "Only bid so far" : "Lowest price");
        if (mine.checkedBags() > request.checkedBags()
                && rivals.stream().allMatch(offer -> offer.checkedBags() < mine.checkedBags())) {
            strengths.add("Best baggage offer");
        }
        if (mine.direct() && rivals.stream().anyMatch(offer -> !offer.direct())) {
            strengths.add("Direct flight (not every bidder offers one)");
        }
        int cheaper = rank - 1;
        String note = rank == 1
                ? "You are the cheapest valid bid right now. Rivals can still undercut you before bidding closes."
                : cheaper + (cheaper == 1 ? " bid is" : " bids are") + " cheaper than yours. Lower your price or add value to climb.";
        return new Standing(rank, active.size(), strengths, note);
    }

    public List<BidThread> getBidsForAirline(String airlineId) {
        if (airlineRepository.findById(airlineId) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Airline not found");
        }
        Map<String, List<Offer>> byRequest = new LinkedHashMap<>();
        for (Offer offer : offers) {
            if (offer.airlineId().equals(airlineId)) {
                byRequest.computeIfAbsent(offer.requestId(), ignored -> new ArrayList<>()).add(offer);
            }
        }
        return byRequest.entrySet().stream()
                .map(entry -> new BidThread(flightRequestService.findById(entry.getKey()),
                        entry.getValue().stream().sorted(Comparator.comparing(Offer::createdAt)).toList()))
                .sorted(Comparator.comparing(thread -> thread.request().biddingClosesAt()))
                .toList();
    }

    private String validate(FlightRequest request, OfferSubmission submission) {
        if (submission.pricePence() > request.maxPricePence()) {
            return "Offer is over the traveller's maximum budget.";
        }
        if (submission.checkedBags() < request.checkedBags()) {
            return "Offer does not include the number of checked bags requested.";
        }
        if (request.directOnly() && !submission.direct()) {
            return "Traveller only accepts direct flights.";
        }
        return null;
    }

    private void refreshBidCount(String requestId) {
        int count = (int) offers.stream().filter(offer -> offer.requestId().equals(requestId)
                && offer.status() == OfferStatus.VALID).count();
        flightRequestService.updateBidCount(requestId, count);
    }

    private Offer withStatus(Offer offer, OfferStatus status) {
        return new Offer(offer.id(), offer.requestId(), offer.airlineId(), offer.pricePence(), offer.checkedBags(),
                offer.direct(), status, offer.reasoning(), offer.createdAt(), offer.rejectionReason(),
                offer.supersedesOfferId(), offer.scoreBreakdown(), offer.airline());
    }

    private Offer withScore(FlightRequest request, Offer offer) {
        if (offer.status() != OfferStatus.VALID && offer.status() != OfferStatus.ACCEPTED
                && offer.status() != OfferStatus.LOST) return offer;
        double priceScore = clamp01((request.maxPricePence() - offer.pricePence()) / (0.5 * request.maxPricePence()));
        double baggageScore = clamp01((double) offer.checkedBags() / request.passengers());
        double directScore = offer.direct() ? 1 : 0;
        double[] scores = {priceScore, baggageScore, directScore};
        String[] names = {"Price", "Baggage", "Direct"};
        List<ScoreComponent> components = new ArrayList<>();
        double total = 0;
        for (int i = 0; i < names.length; i++) {
            double score = Math.round(scores[i] * 1000.0) / 1000.0;
            double weight = SCORE_WEIGHTS.get(names[i]);
            double contribution = Math.round(weight * scores[i] * 1000.0) / 10.0;
            components.add(new ScoreComponent(names[i], weight, score, contribution));
            total += weight * scores[i];
        }
        ScoreBreakdown breakdown = new ScoreBreakdown(Math.round(total * 1000.0) / 10.0, components);
        return new Offer(offer.id(), offer.requestId(), offer.airlineId(), offer.pricePence(), offer.checkedBags(),
                offer.direct(), offer.status(), offer.reasoning(), offer.createdAt(), offer.rejectionReason(),
                offer.supersedesOfferId(), breakdown, offer.airline());
    }

    private AirlineSummary summary(Airline airline) {
        return new AirlineSummary(airline.id(), airline.name(), airline.code(), airline.colour());
    }

    private double clamp01(double value) {
        return Math.max(0, Math.min(1, value));
    }
}
