package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.config.JwtTokenProvider;
import com.saas.saas_pos_bk.dto.LoginRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.AssignSubscriptionRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.BusinessSubscriptionResponseDTO;
import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanResponseDTO;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.BusinessSubscription;
import com.saas.saas_pos_bk.entity.Role;
import com.saas.saas_pos_bk.entity.SubscriptionPlan;
import com.saas.saas_pos_bk.entity.User;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.SubscriptionExpiredException;
import com.saas.saas_pos_bk.repository.BusinessRepository;
import com.saas.saas_pos_bk.repository.BusinessSubscriptionRepository;
import com.saas.saas_pos_bk.repository.SubscriptionPlanRepository;
import com.saas.saas_pos_bk.repository.UserRepository;
import com.saas.saas_pos_bk.service.impl.AuthServiceImpl;
import com.saas.saas_pos_bk.service.impl.SubscriptionPlanServiceImpl;
import com.saas.saas_pos_bk.service.impl.SubscriptionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubscriptionServiceTest {

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Mock
    private BusinessSubscriptionRepository businessSubscriptionRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private SubscriptionPlanServiceImpl subscriptionPlanService;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    private AuthServiceImpl authService;

    private SubscriptionPlan testPlan;
    private Business testBusiness;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, passwordEncoder, tokenProvider, subscriptionService);

        testPlan = SubscriptionPlan.builder()
                .planId(1L)
                .name("Growth Tier")
                .description("Fast retail growth tier")
                .price(new BigDecimal("49.99"))
                .billingCycle("MONTHLY")
                .maxCashiers(5)
                .maxItems(2000)
                .isActive(true)
                .build();

        testBusiness = Business.builder()
                .bId(10L)
                .bName("Nova Retail")
                .bStatus("ACTIVE")
                .email("contact@novaretail.com")
                .build();
    }

    @Test
    void testCreatePlan_Success() {
        SubscriptionPlanRequestDTO dto = SubscriptionPlanRequestDTO.builder()
                .name("Growth Tier")
                .description("Fast retail growth tier")
                .price(new BigDecimal("49.99"))
                .billingCycle("MONTHLY")
                .maxCashiers(5)
                .maxItems(2000)
                .build();

        when(subscriptionPlanRepository.existsByNameIgnoreCase("Growth Tier")).thenReturn(false);
        when(subscriptionPlanRepository.save(any(SubscriptionPlan.class))).thenReturn(testPlan);

        SubscriptionPlanResponseDTO result = subscriptionPlanService.createPlan(dto);

        assertNotNull(result);
        assertEquals("Growth Tier", result.getName());
        assertEquals(new BigDecimal("49.99"), result.getPrice());
        assertTrue(result.getIsActive());
        verify(subscriptionPlanRepository).save(any(SubscriptionPlan.class));
    }

    @Test
    void testCreatePlan_DuplicateName_ThrowsBadRequest() {
        SubscriptionPlanRequestDTO dto = SubscriptionPlanRequestDTO.builder()
                .name("Growth Tier")
                .price(new BigDecimal("49.99"))
                .billingCycle("MONTHLY")
                .maxCashiers(5)
                .maxItems(2000)
                .build();

        when(subscriptionPlanRepository.existsByNameIgnoreCase("Growth Tier")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> subscriptionPlanService.createPlan(dto));
        verify(subscriptionPlanRepository, never()).save(any(SubscriptionPlan.class));
    }

    @Test
    void testTogglePlanStatus() {
        when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));

        subscriptionPlanService.togglePlanStatus(1L);

        assertFalse(testPlan.getIsActive());
        verify(subscriptionPlanRepository).save(testPlan);
    }

    @Test
    void testAssignSubscription_ExpiresPreviousAndSetsValidDates() {
        AssignSubscriptionRequestDTO dto = AssignSubscriptionRequestDTO.builder()
                .businessId(10L)
                .planId(1L)
                .durationMonths(3)
                .notes("Payment completed via bank")
                .build();

        BusinessSubscription oldSub = BusinessSubscription.builder()
                .subId(100L)
                .business(testBusiness)
                .plan(testPlan)
                .startDate(LocalDateTime.now().minusMonths(2))
                .endDate(LocalDateTime.now().plusMonths(1))
                .status("ACTIVE")
                .paymentStatus("PAID")
                .build();

        List<BusinessSubscription> previousActive = new ArrayList<>();
        previousActive.add(oldSub);

        when(businessRepository.findById(10L)).thenReturn(Optional.of(testBusiness));
        when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));
        when(businessSubscriptionRepository.findByBusinessBIdAndStatus(10L, "ACTIVE")).thenReturn(previousActive);

        when(businessSubscriptionRepository.save(any(BusinessSubscription.class))).thenAnswer(invocation -> {
            BusinessSubscription s = invocation.getArgument(0);
            if (s.getSubId() == null) {
                s.setSubId(200L);
            }
            return s;
        });

        BusinessSubscriptionResponseDTO result = subscriptionService.assignSubscription(dto);

        assertNotNull(result);
        assertEquals("Nova Retail", result.getBusinessName());
        assertEquals("Growth Tier", result.getPlanName());
        assertEquals("ACTIVE", result.getStatus());
        assertFalse(result.getIsExpired());

        // Previous subscription should now be EXPIRED
        assertEquals("EXPIRED", oldSub.getStatus());
        verify(businessSubscriptionRepository, atLeast(2)).save(any(BusinessSubscription.class));
    }

    @Test
    void testIsBusinessSubscriptionActive_ActiveSubscription() {
        BusinessSubscription activeSub = BusinessSubscription.builder()
                .subId(101L)
                .business(testBusiness)
                .plan(testPlan)
                .startDate(LocalDateTime.now().minusDays(5))
                .endDate(LocalDateTime.now().plusMonths(1))
                .status("ACTIVE")
                .paymentStatus("PAID")
                .build();

        when(businessSubscriptionRepository.findFirstByBusinessBIdAndStatusOrderByEndDateDesc(10L, "ACTIVE"))
                .thenReturn(Optional.of(activeSub));

        boolean isActive = subscriptionService.isBusinessSubscriptionActive(10L);

        assertTrue(isActive);
        verify(businessSubscriptionRepository, never()).save(any());
    }

    @Test
    void testIsBusinessSubscriptionActive_ExpiredDate_MarksExpiredAndReturnsFalse() {
        BusinessSubscription pastSub = BusinessSubscription.builder()
                .subId(102L)
                .business(testBusiness)
                .plan(testPlan)
                .startDate(LocalDateTime.now().minusMonths(2))
                .endDate(LocalDateTime.now().minusDays(1)) // In the past!
                .status("ACTIVE")
                .paymentStatus("PAID")
                .build();

        when(businessSubscriptionRepository.findFirstByBusinessBIdAndStatusOrderByEndDateDesc(10L, "ACTIVE"))
                .thenReturn(Optional.of(pastSub));

        boolean isActive = subscriptionService.isBusinessSubscriptionActive(10L);

        assertFalse(isActive);
        assertEquals("EXPIRED", pastSub.getStatus());
        verify(businessSubscriptionRepository).save(pastSub);
    }

    @Test
    void testLoginEnforcement_ExpiredBusinessSubscription_ThrowsSubscriptionExpiredException() {
        User tenantUser = User.builder()
                .uId(50L)
                .uEmail("owner@novaretail.com")
                .uPassword("encoded_pwd")
                .role(Role.ROLE_BUSINESS_OWNER)
                .business(testBusiness)
                .status("ACTIVE")
                .build();

        LoginRequestDTO loginDTO = new LoginRequestDTO("owner@novaretail.com", "password123");

        when(userRepository.findByUEmail("owner@novaretail.com")).thenReturn(Optional.of(tenantUser));
        when(passwordEncoder.matches("password123", "encoded_pwd")).thenReturn(true);
        // Subscription check returns false
        when(businessSubscriptionRepository.findFirstByBusinessBIdAndStatusOrderByEndDateDesc(10L, "ACTIVE"))
                .thenReturn(Optional.empty());

        SubscriptionExpiredException ex = assertThrows(SubscriptionExpiredException.class,
                () -> authService.login(loginDTO));

        assertEquals("Your business subscription has expired. Please contact the administrator.", ex.getMessage());
    }

    @Test
    void testLoginEnforcement_SuperAdmin_AllowedWithoutSubscription() {
        User superAdmin = User.builder()
                .uId(1L)
                .uEmail("superadmin@pos.com")
                .uPassword("encoded_pwd")
                .role(Role.ROLE_SUPER_ADMIN)
                .business(null)
                .status("ACTIVE")
                .build();

        LoginRequestDTO loginDTO = new LoginRequestDTO("superadmin@pos.com", "SuperAdmin@123");

        when(userRepository.findByUEmail("superadmin@pos.com")).thenReturn(Optional.of(superAdmin));
        when(passwordEncoder.matches("SuperAdmin@123", "encoded_pwd")).thenReturn(true);
        when(tokenProvider.generateToken(superAdmin)).thenReturn("mock_token_xyz");

        var response = authService.login(loginDTO);

        assertNotNull(response);
        assertEquals("mock_token_xyz", response.getToken());
        assertEquals("superadmin@pos.com", response.getUEmail());
        assertEquals(Role.ROLE_SUPER_ADMIN, response.getRole());
    }
}
