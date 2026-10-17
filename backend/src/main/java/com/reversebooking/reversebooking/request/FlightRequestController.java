package com.reversebooking.reversebooking.request;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class FlightRequestController {
    private final FlightRequestService service;

    public FlightRequestController(FlightRequestService service) {
        this.service = service;
    }

    @PostMapping
    public FlightRequest create(@Valid @RequestBody FlightRequest request) {
        return service.add(request);
    }

    @GetMapping
    public List<FlightRequest> getAll() {
        return service.getAll();
    }
}
