package com.ezfarm.donnie.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.embedded.undertow.UndertowServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;

@Configuration
public class UndertowConfig {

    @Value("${http.port}")
    private int httpPort;

    private String httpInterface = "0.0.0.0";

    @Bean
    public WebServerFactoryCustomizer containerCustomizer() {
        return (WebServerFactoryCustomizer) factory -> {
            UndertowServletWebServerFactory undertowFactory = (UndertowServletWebServerFactory) factory;
            undertowFactory.getBuilderCustomizers().add(builder -> {
                builder.addHttpListener(httpPort, httpInterface);
            });
        };
    }
}
