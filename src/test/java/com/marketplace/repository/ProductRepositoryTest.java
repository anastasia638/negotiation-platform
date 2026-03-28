package com.marketplace.repository;

import com.marketplace.model.Product;
import com.marketplace.model.User;
import com.marketplace.model.UserType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class ProductRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Test
    public void testSaveAndFindProduct() {
        // Créer un user seller
        User seller = new User("Test Seller", "test@seller.com", UserType.SELLER);
        seller.setPassword("hashed");
        entityManager.persist(seller);
        entityManager.flush();
        
        // Créer un produit
        Product product = new Product(
            seller,
            "Test Luxury Bag",
            "bags",
            new BigDecimal("1000"),
            new BigDecimal("2000")
        );
        
        // Sauvegarder via Repository
        Product saved = productRepository.save(product);
        
        // Vérifications
        assertNotNull(saved.getId());
        assertEquals("Test Luxury Bag", saved.getName());
        assertEquals("bags", saved.getCategory());
    }
    
    @Test
    public void testFindById() {
        // Créer seller
        User seller = new User("Anastasia Seller", "anastasia@test.com", UserType.SELLER);
        seller.setPassword("hashed");
        entityManager.persist(seller);
        
        // Créer produit
        Product product = new Product(
            seller, 
            "Hermes Watch", 
            "watches", 
            new BigDecimal("5000"), 
            new BigDecimal("8000")
        );
        entityManager.persist(product);
        entityManager.flush();
        
        // Récupérer
        Product found = productRepository.findById(product.getId()).orElse(null);
        
        // Vérifier
        assertNotNull(found);
        assertEquals("Hermes Watch", found.getName());
        assertEquals("watches", found.getCategory());
    }
    
    @Test
    public void testCountProducts() {
        long count = productRepository.count();
        assertTrue(count >= 0);
    }
}
