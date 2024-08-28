package org.example.mycrud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MycrudApplication {

    public static void main(String[] args) {
        SpringApplication.run(MycrudApplication.class, args);
    }
    // Implementing simple caching for demonstration purposes

}
