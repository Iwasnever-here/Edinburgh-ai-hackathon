package com.reversebooking.reversebooking.airline;

import com.reversebooking.reversebooking.offer.BidThread;
import com.reversebooking.reversebooking.offer.OfferService;
import com.reversebooking.reversebooking.request.FlightRequest;
import com.reversebooking.reversebooking.request.FlightRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/airlines")
public class AirlineController {
    private static final Set<String> STRATEGY_MODES = Set.of("AGGRESSIVE", "BALANCED", "PREMIUM");

    private final AirlineRepository airlineRepository;
    private final FlightRequestService flightRequestService;
    private final OfferService offerService;

    public AirlineController(AirlineRepository airlineRepository,
                             FlightRequestService flightRequestService,
                             OfferService offerService) {
        this.airlineRepository = airlineRepository;
        this.flightRequestService = flightRequestService;
        this.offerService = offerService;
    }

    @GetMapping
    public List<Airline> getAll() {
        return airlineRepository.findAll();
    }

    @GetMapping("/{airlineId}/marketplace")
    public List<FlightRequest> getMarketplace(@PathVariable String airlineId) {
        requireAirline(airlineId);
        return flightRequestService.getOpenMarketplace();
    }

    @GetMapping("/{airlineId}/bids")
    public List<BidThread> getBids(@PathVariable String airlineId) {
        return offerService.getBidsForAirline(airlineId);
    }

    @PutMapping("/{airlineId}/strategy")
    public Airline updateStrategy(@PathVariable String airlineId, @RequestBody Strategy strategy) {
        requireAirline(airlineId);
        if (strategy.mode() == null || !STRATEGY_MODES.contains(strategy.mode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown bidding strategy");
        }
        return airlineRepository.updateStrategy(airlineId, strategy);
    }

    private Airline requireAirline(String airlineId) {
        Airline airline = airlineRepository.findById(airlineId);
        if (airline == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Airline not found");
        return airline;
    }
}
