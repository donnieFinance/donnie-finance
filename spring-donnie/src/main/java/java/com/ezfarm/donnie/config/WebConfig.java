package com.ezfarm.donnie.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // springboot2.4.0 에서 CORS한번에 설정..
    // springboot2.4.x 부터 allowedOriginPatterns 을 명시적으로 적용해야함 * 불가
    // 주의::Hostname이 같더라도 다른 포트번호를 사용한다면 다른 Origin입니다. 그리고 http와 https를 구분합니다.
    @Bean
    public WebMvcConfigurer configurer(){
        return new WebMvcConfigurer(){
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(
                                "http://localhost:8062", "http://localhost",
                                "http://donnie.finance", "https://donnie.finance",
                                "http://210.92.91.206", "https://210.92.91.206"
                        )
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public ObjectMapper objectMapper() {

        ObjectMapper mapper = JacksonConfig.getInstance().getMapper();
        return mapper;
    }


    @Bean
    public RestTemplate restTemplate() {

        //2..0 test error: 4HttpComponentsClientHttpRequestFactory httpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        //2..0 test error: RestTemplate restTemplate = new RestTemplate(new BufferingClientHttpRequestFactory(httpRequestFactory));

        RestTemplate restTemplate = new RestTemplate();

        return restTemplate;
    }
}