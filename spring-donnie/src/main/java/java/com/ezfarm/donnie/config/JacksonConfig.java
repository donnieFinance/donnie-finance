package com.ezfarm.donnie.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class JacksonConfig {

    private static JacksonConfig instance;

    public static synchronized JacksonConfig getInstance() {
        if(instance == null){
            instance = new JacksonConfig();
        }
        return instance;
    }

    // An instance of Jackson ObjectMapper that can be used anywhere else for Json.
    final static ObjectMapper mapper = new ObjectMapper();
    static {
        JavaTimeModule module = new JavaTimeModule();
        LocalDateTimeDeserializer deserializer = new LocalDateTimeDeserializer(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        module.addDeserializer(LocalDateTime.class, deserializer);
        mapper.registerModule(module);
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    // Return instance of Jackson Object Mapper
    public ObjectMapper getMapper() {
        return mapper;
    }
}
