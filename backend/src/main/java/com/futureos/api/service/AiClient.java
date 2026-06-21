package com.futureos.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.futureos.api.dto.WorkflowDtos.OnboardingRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;


@Service
public class AiClient {
    private static final Logger log = LoggerFactory.getLogger(AiClient.class);
    private final RestClient rest;
    private final ObjectMapper objectMapper;

    public AiClient(RestClient.Builder builder,
                    ObjectMapper objectMapper,
                    @Value("${futureos.ai-base-url}") String baseUrl) {
        this.rest = builder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
        log.info("FutureOS AiClient initialised — AI base URL: {}", baseUrl);
    }


    public Map<String, Object> onboard(OnboardingRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("goal",                 safe(request.goal()));
        payload.put("biggestConfusion",     safe(request.biggestConfusion()));
        payload.put("successDefinition",    safe(request.successDefinition()));
        payload.put("weeklyAvailableHours", request.weeklyAvailableHours() == null ? 0 : request.weeklyAvailableHours());
        payload.put("background",           safe(request.background()));
        payload.put("resumeUrl",            safe(request.resumeUrl()));
        payload.put("githubUrl",            safe(request.githubUrl()));
        payload.put("portfolioUrl",         safe(request.portfolioUrl()));
        payload.put("projectZipUrl",        safe(request.projectZipUrl()));

        log.info("FutureOS AiClient.onboard → payload keys: {}", payload.keySet());
        return postJson("/ai/future-simulation", payload);
    }

    public Map<String, Object> simulateFutures(Map<String, Object> request) {
        return postJson("/ai/future-simulation", request);
    }

    public Map<String, Object> gap(Map<String, Object> request) {
        return postJson("/ai/gap-analysis", request);
    }

    public Map<String, Object> roadmap(Map<String, Object> request) {
        return postJson("/ai/roadmap", request);
    }

    public Map<String, Object> accountability(Map<String, Object> request) {
        return postJson("/ai/accountability", request);
    }

    public Map<String, Object> lifeExperimentPlan(Map<String, Object> request) {
        return postJsonSoft("/ai/life-experiment", request);
    }

    public Map<String, Object> lifeExperimentVerdict(Map<String, Object> request) {
        return postJsonSoft("/ai/life-experiment/verdict", request);
    }

    /**
     * Like postJson, but returns null instead of throwing when the AI service
     * doesn't implement the route yet (404) or is unreachable. Callers that can
     * fall back to local logic (e.g. life-experiment plan/verdict) should use
     * this; callers with no fallback (onboarding, roadmap, gap-analysis) should
     * keep using postJson so failures surface clearly instead of silently
     * degrading.
     */
    @SuppressWarnings({"unchecked", "rawtypes"})
    private Map<String, Object> postJsonSoft(String uri, Map<String, Object> payload) {
        try {
            return postJson(uri, payload);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound notFound) {
            log.warn("FutureOS AiClient ← {} not implemented by AI service yet (404). Falling back to local logic.", uri);
            return null;
        } catch (org.springframework.web.client.RestClientException ex) {
            log.warn("FutureOS AiClient ← {} call failed ({}). Falling back to local logic.", uri, ex.getMessage());
            return null;
        }
    }


    @SuppressWarnings({"unchecked", "rawtypes"})
    private Map<String, Object> postJson(String uri, Map<String, Object> payload) {
        if (payload == null) payload = new LinkedHashMap<>();

        log.info("FutureOS AiClient → POST {} | keys: {}", uri, payload.keySet());

        // -----------------------------------------------------------------------
        // WHY byte[] AND NOT String:
        //
        // Spring Boot's default HTTP client (SimpleClientHttpRequestFactory /
        // HttpURLConnection) does not know the body length when a String is written
        // through a converter, so it falls back to Transfer-Encoding: chunked.
        //
        // uvicorn's HTTP/1.1 parser (h11) rejects chunked-encoded requests in the
        // version bundled with this project, silently delivering 0 bytes to the
        // FastAPI endpoint — which then returns 422 "Field required" on the body.
        // This is confirmed by the "WARNING: Invalid HTTP request received." line
        // printed by uvicorn for every onboarding attempt.
        //
        // Fix: serialize to byte[] with ObjectMapper *before* handing the body to
        // RestClient. ByteArrayHttpMessageConverter always emits a Content-Length
        // header (the array length is known at call time), which h11 / uvicorn
        // handles correctly, and the full JSON body arrives at FastAPI.
        // -----------------------------------------------------------------------
        final byte[] jsonBytes;
        try {
            jsonBytes = objectMapper.writeValueAsBytes(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize AI request payload: " + e.getMessage(), e);
        }

        log.debug("FutureOS AiClient → POST {} | body ({} bytes): {}",
                uri, jsonBytes.length, new String(jsonBytes));

        Map<String, Object> response = rest.post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(jsonBytes)          // byte[] → Content-Length header → h11/uvicorn compatible
                .retrieve()
                .body(Map.class);

        if (response == null || response.isEmpty()) {
            log.error("FutureOS AiClient ← {} returned empty/null body", uri);
            throw new IllegalStateException(
                    "AI service returned an empty response for: " + uri
                            + ". Verify GROQ_API_KEY / OPENAI_API_KEY is set correctly.");
        }

        log.info("FutureOS AiClient ← {} response keys: {}", uri, response.keySet());
        return response;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}