package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.LoyaltySetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltySettingRepository extends JpaRepository<LoyaltySetting, Long> {
}
