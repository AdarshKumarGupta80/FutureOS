package com.futureos.api.config;

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.util.concurrent.TimeUnit;

@Configuration
public class AppConfig {

    @Bean
    RestClient.Builder restClientBuilder() {
        // Generous timeouts to survive free-tier cold starts (AI service may
        // take 30-60 s to wake up after inactivity on Render free plan).
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(90, TimeUnit.SECONDS)
                .setResponseTimeout(120, TimeUnit.SECONDS)
                .build();

        HttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build();

        HttpComponentsClientHttpRequestFactory factory =
                new HttpComponentsClientHttpRequestFactory(httpClient);

        return RestClient.builder().requestFactory(factory);
    }
}