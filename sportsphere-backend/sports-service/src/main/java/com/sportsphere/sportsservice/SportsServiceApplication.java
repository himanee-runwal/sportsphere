package com.sportsphere.sportsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication(scanBasePackages = {"com.sportsphere.sportsservice", "com.sportsphere.common"})
public class SportsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SportsServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseCleanup(JdbcTemplate jdbcTemplate) {
        return args -> {
            Logger logger = LoggerFactory.getLogger(SportsServiceApplication.class);
            try {
                logger.info("Checking for obsolete database columns...");
                jdbcTemplate.execute("ALTER TABLE venue_images DROP COLUMN drive_file_id");
                logger.info("Successfully dropped old 'drive_file_id' column.");
            } catch (Exception e) {
                logger.info("Column 'drive_file_id' already dropped or not found.");
            }
            try {
                jdbcTemplate.execute("ALTER TABLE venue_images DROP COLUMN url");
                logger.info("Successfully dropped old 'url' column.");
            } catch (Exception e) {
                logger.info("Column 'url' already dropped or not found.");
            }
        };
    }
}
