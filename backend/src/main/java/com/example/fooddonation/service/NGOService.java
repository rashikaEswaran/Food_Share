package com.example.fooddonation.service;

import com.example.fooddonation.exception.ResourceNotFoundException;
import com.example.fooddonation.model.NGO;
import com.example.fooddonation.repository.NGORepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NGOService {

    private final NGORepository ngoRepository;

    public NGOService(NGORepository ngoRepository) {
        this.ngoRepository = ngoRepository;
    }

    public NGO addNGO(NGO ngo) {
        return ngoRepository.save(ngo);
    }

    public List<NGO> getAllNGOs() {
        return ngoRepository.findAll();
    }

    public NGO getNGOById(Long id) {
        return ngoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found with id: " + id));
    }

    public NGO updateNGO(Long id, NGO updatedNGO) {
        NGO existingNGO = getNGOById(id);
        existingNGO.setName(updatedNGO.getName());
        existingNGO.setEmail(updatedNGO.getEmail());
        existingNGO.setPhone(updatedNGO.getPhone());
        existingNGO.setAddress(updatedNGO.getAddress());
        return ngoRepository.save(existingNGO);
    }

    public void deleteNGO(Long id) {
        NGO existingNGO = getNGOById(id);
        ngoRepository.delete(existingNGO);
    }
}
