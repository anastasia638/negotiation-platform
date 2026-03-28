package com.marketplace.controller;

import com.marketplace.model.Product;
import com.marketplace.model.User;
import com.marketplace.model.UserType;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class NegotiationControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired ProductRepository productRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private User buyer;
    private User seller;
    private Product product;

    @BeforeEach
    void setUp() {
        buyer = new User();
        buyer.setName("Test Buyer");
        buyer.setEmail("buyer@test.com");
        buyer.setPassword(passwordEncoder.encode("password"));
        buyer.setUserType(UserType.BUYER);
        buyer = userRepository.save(buyer);

        seller = new User();
        seller.setName("Test Seller");
        seller.setEmail("seller@test.com");
        seller.setPassword(passwordEncoder.encode("password"));
        seller.setUserType(UserType.SELLER);
        seller = userRepository.save(seller);

        product = new Product();
        product.setName("Test Product");
        product.setSeller(seller);
        product.setPriceMin(new BigDecimal("100.00"));
        product.setPriceMax(new BigDecimal("500.00"));
        product.setStockQuantity(10);
        product = productRepository.save(product);
    }

    @Test
    @WithMockUser(roles = "BUYER")
    void startNegotiation_asBuyer_returns201() throws Exception {
        mockMvc.perform(post("/api/negotiations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format(
                        "{\"buyerIdRequest\":%d,\"productIdRequest\":%d}",
                        buyer.getId(), product.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.status").value("NEGOTIATING"))
                .andExpect(jsonPath("$.buyerName").value("Test Buyer"))
                .andExpect(jsonPath("$.sellerName").value("Test Seller"));
    }

    @Test
    @WithMockUser(roles = "SELLER")
    void startNegotiation_asSeller_returns403() throws Exception {
        mockMvc.perform(post("/api/negotiations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format(
                        "{\"buyerIdRequest\":%d,\"productIdRequest\":%d}",
                        buyer.getId(), product.getId())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "BUYER")
    void startNegotiation_sellerBuyingOwnProduct_returns400() throws Exception {
        // Seller essaie de négocier son propre produit en tant qu'acheteur
        mockMvc.perform(post("/api/negotiations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format(
                        "{\"buyerIdRequest\":%d,\"productIdRequest\":%d}",
                        seller.getId(), product.getId())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "BUYER")
    void autoRespond_withGreedyStrategy_works() throws Exception {
        // Démarrer la négociation
        String negoResponse = mockMvc.perform(post("/api/negotiations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format(
                        "{\"buyerIdRequest\":%d,\"productIdRequest\":%d}",
                        buyer.getId(), product.getId())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Extraire l'ID de la négociation
        Long negoId = Long.parseLong(negoResponse.split("\"id\":")[1].split(",")[0]);

        // L'acheteur fait une première offre
        mockMvc.perform(post("/api/negotiations/" + negoId + "/offers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format(
                        "{\"senderId\":%d,\"proposedPrice\":150.00,\"proposedQuantity\":1}",
                        buyer.getId())))
                .andExpect(status().isCreated());

        // Le vendeur répond automatiquement avec stratégie GREEDY
        mockMvc.perform(post("/api/negotiations/" + negoId + "/auto-respond")
                .param("responderId", seller.getId().toString())
                .param("strategy", "GREEDY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NEGOTIATING"));
    }
}
