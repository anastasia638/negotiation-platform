package com.marketplace.service;

import com.marketplace.dto.ProductDTO;
import com.marketplace.model.Product;
import com.marketplace.model.User;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Page<ProductDTO> findAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toDTO);
    }

    public ProductDTO findById(Long id) {
        return productRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produit introuvable : " + id));
    }

    @Transactional
    public ProductDTO create(ProductDTO dto) {
        User seller = null;
        if (dto.getSellerId() != null) {
            seller = userRepository.findById(dto.getSellerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendeur introuvable : " + dto.getSellerId()));
        }
        Product product = toEntity(dto, seller);
        return toDTO(productRepository.save(product));
    }

    @Transactional
    public ProductDTO update(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produit introuvable : " + id));

        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setBrand(dto.getBrand());
        product.setPriceMin(dto.getPriceMin());
        product.setPriceMax(dto.getPriceMax());
        product.setBasePrice(dto.getBasePrice());
        product.setStockQuantity(dto.getStockQuantity());

        return toDTO(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produit introuvable : " + id);
        }
        productRepository.deleteById(id);
    }

    // ---------- Mappers ----------

    private ProductDTO toDTO(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setBrand(p.getBrand());
        dto.setPriceMin(p.getPriceMin());
        dto.setPriceMax(p.getPriceMax());
        dto.setBasePrice(p.getBasePrice());
        dto.setStockQuantity(p.getStockQuantity());
        dto.setCreatedAt(p.getCreatedAt());
        if (p.getSeller() != null) {
            dto.setSellerId(p.getSeller().getId());
            dto.setSellerName(p.getSeller().getName());
        }
        return dto;
    }

    private Product toEntity(ProductDTO dto, User seller) {
        Product p = new Product();
        p.setSeller(seller);
        p.setName(dto.getName());
        p.setCategory(dto.getCategory());
        p.setBrand(dto.getBrand());
        p.setPriceMin(dto.getPriceMin());
        p.setPriceMax(dto.getPriceMax());
        p.setBasePrice(dto.getBasePrice());
        p.setStockQuantity(dto.getStockQuantity());
        return p;
    }
}
