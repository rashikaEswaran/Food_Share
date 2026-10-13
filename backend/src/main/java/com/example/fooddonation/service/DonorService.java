package com.example.fooddonation.service;

import com.example.fooddonation.exception.ResourceNotFoundException;
import com.example.fooddonation.model.Donor;
import com.example.fooddonation.repository.DonorRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DonorService {

    private final DonorRepository donorRepository;

    public DonorService(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    public Donor addDonor(Donor donor) {
        return donorRepository.save(donor);
    }

    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    public Donor getDonorById(Long id) {
        return donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found with id: " + id));
    }

    public Donor updateDonor(Long id, Donor updatedDonor) {
        Donor existingDonor = getDonorById(id);
        existingDonor.setName(updatedDonor.getName());
        existingDonor.setEmail(updatedDonor.getEmail());
        existingDonor.setPhone(updatedDonor.getPhone());
        existingDonor.setOrganizationName(updatedDonor.getOrganizationName());
        return donorRepository.save(existingDonor);
    }

    public void deleteDonor(Long id) {
        Donor existingDonor = getDonorById(id);
        donorRepository.delete(existingDonor);
    }
}
