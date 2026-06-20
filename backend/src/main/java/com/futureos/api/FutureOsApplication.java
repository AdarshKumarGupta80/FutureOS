package com.futureos.api;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;

@SpringBootApplication
public class FutureOsApplication {
  public static void main(String[] args) {
    SpringApplication.run(FutureOsApplication.class, args);
  }
    }
