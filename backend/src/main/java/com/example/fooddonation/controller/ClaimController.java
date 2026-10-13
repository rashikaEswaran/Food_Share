package com.example.fooddonation.controller;

import com.example.fooddonation.model.Claim;
import com.example.fooddonation.service.ClaimService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<Claim> createClaim(@RequestBody Map<String, Long> payload) {
        Long foodListingId = payload.get("foodListingId");
        Long ngoId = payload.get("ngoId");
        Claim createdClaim = claimService.createClaim(foodListingId, ngoId);
        return new ResponseEntity<>(createdClaim, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimById(id));
    }

    @PutMapping("/{id}/collect")
    public ResponseEntity<Claim> markAsCollected(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.markAsCollected(id));
    }
}
