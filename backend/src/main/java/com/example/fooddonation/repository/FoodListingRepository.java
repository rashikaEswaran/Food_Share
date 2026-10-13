package com.example.fooddonation.repository;

import com.example.fooddonation.model.FoodListing;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodListingRepository extends JpaRepository<FoodListing, Long> {
    List<FoodListing> findByStatus(String status);
}
