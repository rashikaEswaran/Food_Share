package com.example.fooddonation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "food_listing_id", nullable = false, unique = true)
    @NotNull(message = "Food listing is required")
    private FoodListing foodListing;

    @ManyToOne
    @JoinColumn(name = "ngo_id", nullable = false)
    @NotNull(message = "NGO is required")
    private NGO ngo;

    private LocalDateTime claimedAt;

    private LocalDateTime collectedAt;

    @Column(nullable = false)
    private String status; // CLAIMED, COLLECTED

    public Claim() {
    }

    @PrePersist
    public void prePersist() {
        if (this.claimedAt == null) {
            this.claimedAt = LocalDateTime.now();
        }
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "CLAIMED";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoodListing getFoodListing() {
        return foodListing;
    }

    public void setFoodListing(FoodListing foodListing) {
        this.foodListing = foodListing;
    }

    public NGO getNgo() {
        return ngo;
    }

    public void setNgo(NGO ngo) {
        this.ngo = ngo;
    }

    public LocalDateTime getClaimedAt() {
        return claimedAt;
    }

    public void setClaimedAt(LocalDateTime claimedAt) {
        this.claimedAt = claimedAt;
    }

    public LocalDateTime getCollectedAt() {
        return collectedAt;
    }

    public void setCollectedAt(LocalDateTime collectedAt) {
        this.collectedAt = collectedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
