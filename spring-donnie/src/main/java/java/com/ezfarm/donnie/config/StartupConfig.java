package com.ezfarm.donnie.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// https://www.baeldung.com/running-setup-logic-on-startup-in-spring

@Configuration
public class StartupConfig {

    @Bean(initMethod="init")
    public StartupBean startupBean() {
        return new StartupBean();
    }
}