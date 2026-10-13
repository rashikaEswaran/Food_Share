package com.example.fooddonation.controller;

import com.example.fooddonation.model.NGO;
import com.example.fooddonation.service.NGOService;
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
@RequestMapping("/api/ngos")
@CrossOrigin(origins = "*")
public class NGOController {

    private final NGOService ngoService;

    public NGOController(NGOService ngoService) {
        this.ngoService = ngoService;
    }

    @PostMapping
    public ResponseEntity<NGO> addNGO(@Valid @RequestBody NGO ngo) {
        NGO savedNGO = ngoService.addNGO(ngo);
        return new ResponseEntity<>(savedNGO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<NGO>> getAllNGOs() {
        return ResponseEntity.ok(ngoService.getAllNGOs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NGO> getNGOById(@PathVariable Long id) {
        return ResponseEntity.ok(ngoService.getNGOById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NGO> updateNGO(@PathVariable Long id, @Valid @RequestBody NGO ngo) {
        return ResponseEntity.ok(ngoService.updateNGO(id, ngo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNGO(@PathVariable Long id) {
        ngoService.deleteNGO(id);
        return ResponseEntity.noContent().build();
    }
}
