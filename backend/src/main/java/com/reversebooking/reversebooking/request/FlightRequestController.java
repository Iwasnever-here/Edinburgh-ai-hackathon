package com.reversebooking.reversebooking.request;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping("/{requestId}")
    public FlightRequest getById(@PathVariable String requestId) {
        FlightRequest request = service.findById(requestId);
        if (request == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        return request;
    }
}
