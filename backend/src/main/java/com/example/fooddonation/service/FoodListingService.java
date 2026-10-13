package com.example.fooddonation.service;

import com.example.fooddonation.exception.InvalidOperationException;
import com.example.fooddonation.exception.ResourceNotFoundException;
import com.example.fooddonation.model.Donor;
import com.example.fooddonation.model.FoodListing;
import com.example.fooddonation.repository.FoodListingRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class FoodListingService {

    private final FoodListingRepository foodListingRepository;
    private final DonorService donorService;

    public FoodListingService(FoodListingRepository foodListingRepository, DonorService donorService) {
        this.foodListingRepository = foodListingRepository;
        this.donorService = donorService;
    }

    public FoodListing createFoodListing(FoodListing foodListing) {
        if (foodListing.getQuantity() == null || foodListing.getQuantity() <= 0) {
            throw new InvalidOperationException("Quantity must be greater than zero");
        }

        if (foodListing.getDonor() == null || foodListing.getDonor().getId() == null) {
            throw new InvalidOperationException("Food listing must be associated with a valid donor");
        }

        // Validate that donor exists
        Donor donor = donorService.getDonorById(foodListing.getDonor().getId());
        foodListing.setDonor(donor);

        if (foodListing.getExpiryTime() != null && foodListing.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new InvalidOperationException("Expiry time cannot be in the past");
        }

        foodListing.setStatus("AVAILABLE");
        return foodListingRepository.save(foodListing);
    }

    public List<FoodListing> getAllFoodListings() {
        List<FoodListing> listings = foodListingRepository.findAll();
        // Check and update any expired items
        for (FoodListing listing : listings) {
            checkAndUpdateExpiry(listing);
        }
        return listings;
    }

    public FoodListing getFoodListingById(Long id) {
        FoodListing listing = foodListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food listing not found with id: " + id));
        checkAndUpdateExpiry(listing);
        return listing;
    }

    public List<FoodListing> getAvailableFoodListings() {
        List<FoodListing> availableListings = foodListingRepository.findByStatus("AVAILABLE");
        List<FoodListing> activeAvailable = new ArrayList<>();

        for (FoodListing listing : availableListings) {
            if (checkAndUpdateExpiry(listing)) {
                // If it became expired, it's not available
                continue;
            }
            activeAvailable.add(listing);
        }
        return activeAvailable;
    }

    public FoodListing updateFoodListing(Long id, FoodListing updatedListing) {
        FoodListing existing = getFoodListingById(id);

        if (updatedListing.getQuantity() != null) {
            if (updatedListing.getQuantity() <= 0) {
                throw new InvalidOperationException("Quantity must be greater than zero");
            }
            existing.setQuantity(updatedListing.getQuantity());
        }

        if (updatedListing.getFoodName() != null && !updatedListing.getFoodName().trim().isEmpty()) {
            existing.setFoodName(updatedListing.getFoodName());
        }

        if (updatedListing.getDescription() != null) {
            existing.setDescription(updatedListing.getDescription());
        }

        if (updatedListing.getUnit() != null && !updatedListing.getUnit().trim().isEmpty()) {
            existing.setUnit(updatedListing.getUnit());
        }

        if (updatedListing.getPickupLocation() != null && !updatedListing.getPickupLocation().trim().isEmpty()) {
            existing.setPickupLocation(updatedListing.getPickupLocation());
        }

        if (updatedListing.getExpiryTime() != null) {
            existing.setExpiryTime(updatedListing.getExpiryTime());
            checkAndUpdateExpiry(existing);
        }

        return foodListingRepository.save(existing);
    }

    public void deleteFoodListing(Long id) {
        FoodListing existing = getFoodListingById(id);
        foodListingRepository.delete(existing);
    }

    private boolean checkAndUpdateExpiry(FoodListing listing) {
        if ("AVAILABLE".equalsIgnoreCase(listing.getStatus()) &&
                listing.getExpiryTime() != null &&
                listing.getExpiryTime().isBefore(LocalDateTime.now())) {
            listing.setStatus("EXPIRED");
            foodListingRepository.save(listing);
            return true;
        }
        return false;
    }
}
