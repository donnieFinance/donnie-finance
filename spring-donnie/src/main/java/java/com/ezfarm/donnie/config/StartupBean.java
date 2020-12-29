package com.ezfarm.donnie.config;

import com.ezfarm.donnie.zookeeper.ZookeeperRegistryCenter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import javax.annotation.PostConstruct;


// https://www.baeldung.com/running-setup-logic-on-startup-in-spring

@Slf4j
public class StartupBean implements InitializingBean {
    @Autowired
    ZookeeperRegistryCenter regCenter;


    @Autowired
    MongoTemplate mongoTemplate;

    public StartupBean() {
        log.info("StartupBean Constructor");
    }

    @PostConstruct
    public void postConstruct() {
        log.info("StartupBean PostConstruct");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("StartupBean afterPropertiesSet");
    }

    public void init() {
        log.info("StartupBean init-method");
        regCenter.initZookeeperElectionService();
    }
}