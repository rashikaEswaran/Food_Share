package com.example.fooddonation.repository;

import com.example.fooddonation.model.NGO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NGORepository extends JpaRepository<NGO, Long> {
}
