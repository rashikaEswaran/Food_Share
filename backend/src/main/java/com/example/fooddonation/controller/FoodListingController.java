package com.example.fooddonation.controller;

import com.example.fooddonation.model.FoodListing;
import com.example.fooddonation.service.FoodListingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/food-listings")
@CrossOrigin(origins = "*")
public class FoodListingController {

    private final FoodListingService foodListingService;

    public FoodListingController(FoodListingService foodListingService) {
        this.foodListingService = foodListingService;
    }

    @PostMapping
    public ResponseEntity<FoodListing> createFoodListing(@Valid @RequestBody FoodListing foodListing) {
        FoodListing createdListing = foodListingService.createFoodListing(foodListing);
        return new ResponseEntity<>(createdListing, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FoodListing>> getAllFoodListings() {
        return ResponseEntity.ok(foodListingService.getAllFoodListings());
    }

    @GetMapping("/available")
    public ResponseEntity<List<FoodListing>> getAvailableFoodListings() {
        return ResponseEntity.ok(foodListingService.getAvailableFoodListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodListing> getFoodListingById(@PathVariable Long id) {
        return ResponseEntity.ok(foodListingService.getFoodListingById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodListing> updateFoodListing(@PathVariable Long id, @RequestBody FoodListing foodListing) {
        return ResponseEntity.ok(foodListingService.updateFoodListing(id, foodListing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodListing(@PathVariable Long id) {
        foodListingService.deleteFoodListing(id);
        return ResponseEntity.noContent().build();
    }
}
