package com.marketplace.service;

import com.marketplace.dto.UserDTO;
import com.marketplace.model.User;
import com.marketplace.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDTO> findAll() {
        return userRepository.findAll().stream().map(this::toDTO).toList();
    }

    public UserDTO findById(Long id) {
        return userRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable : " + id));
    }

    @Transactional
    public UserDTO create(UserDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé : " + dto.getEmail());
        }
        return toDTO(userRepository.save(toEntity(dto)));
    }

    @Transactional
    public UserDTO update(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable : " + id));

        // Vérifie que le nouvel email n'appartient pas à un autre utilisateur
        userRepository.findByEmail(dto.getEmail())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(conflict -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé : " + dto.getEmail());
                });

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setUserType(dto.getUserType());

        return toDTO(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable : " + id);
        }
        userRepository.deleteById(id);
    }

    // ---------- Mappers ----------

    private UserDTO toDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setName(u.getName());
        dto.setEmail(u.getEmail());
        dto.setUserType(u.getUserType());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }

    private User toEntity(UserDTO dto) {
        User u = new User();
        u.setName(dto.getName());
        u.setEmail(dto.getEmail());
        u.setUserType(dto.getUserType());
        return u;
    }
}
