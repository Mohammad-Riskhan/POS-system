package com.saas.saas_pos_bk.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DataSeeder implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        log.info("DataSeeder: Super Admin seeding is unified and managed exclusively by DataInitializer.");
    }
}
