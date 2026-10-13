package com.example.fooddonation.service;

import com.example.fooddonation.exception.InvalidOperationException;
import com.example.fooddonation.exception.ResourceNotFoundException;
import com.example.fooddonation.model.Claim;
import com.example.fooddonation.model.FoodListing;
import com.example.fooddonation.model.NGO;
import com.example.fooddonation.repository.ClaimRepository;
import com.example.fooddonation.repository.FoodListingRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final FoodListingRepository foodListingRepository;
    private final NGOService ngoService;

    public ClaimService(ClaimRepository claimRepository,
                        FoodListingRepository foodListingRepository,
                        NGOService ngoService) {
        this.claimRepository = claimRepository;
        this.foodListingRepository = foodListingRepository;
        this.ngoService = ngoService;
    }

    public Claim createClaim(Long foodListingId, Long ngoId) {
        // 1. Food listing must exist
        FoodListing foodListing = foodListingRepository.findById(foodListingId)
                .orElseThrow(() -> new ResourceNotFoundException("Food listing not found with id: " + foodListingId));

        // 2. NGO must exist
        NGO ngo = ngoService.getNGOById(ngoId);

        // 3. Check expiryTime before claiming
        if (foodListing.getExpiryTime() != null && foodListing.getExpiryTime().isBefore(LocalDateTime.now())) {
            foodListing.setStatus("EXPIRED");
            foodListingRepository.save(foodListing);
            throw new InvalidOperationException("Food listing has expired and cannot be claimed");
        }

        // 4. Food listing must be AVAILABLE
        if (!"AVAILABLE".equalsIgnoreCase(foodListing.getStatus())) {
            throw new InvalidOperationException("Food listing is not available for claim. Current status: " + foodListing.getStatus());
        }

        // 5. Update food listing status to CLAIMED
        foodListing.setStatus("CLAIMED");
        foodListingRepository.save(foodListing);

        // 6. Create claim with status CLAIMED and automatic timestamp
        Claim claim = new Claim();
        claim.setFoodListing(foodListing);
        claim.setNgo(ngo);
        claim.setStatus("CLAIMED");
        claim.setClaimedAt(LocalDateTime.now());

        return claimRepository.save(claim);
    }

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public Claim getClaimById(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));
    }

    public Claim markAsCollected(Long claimId) {
        Claim claim = getClaimById(claimId);

        // Do not allow collection of an already collected claim
        if ("COLLECTED".equalsIgnoreCase(claim.getStatus())) {
            throw new InvalidOperationException("Food has already been collected for this claim");
        }

        // Update Claim status to COLLECTED and set collectedAt
        claim.setStatus("COLLECTED");
        claim.setCollectedAt(LocalDateTime.now());

        // Update associated FoodListing status to COLLECTED
        FoodListing foodListing = claim.getFoodListing();
        if (foodListing != null) {
            foodListing.setStatus("COLLECTED");
            foodListingRepository.save(foodListing);
        }

        return claimRepository.save(claim);
    }
}
