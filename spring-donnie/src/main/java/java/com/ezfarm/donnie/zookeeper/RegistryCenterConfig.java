package com.ezfarm.donnie.zookeeper;

import com.ezfarm.donnie.zookeeper.conf.ZookeeperConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ConditionalOnExpression("'${spring.data.zookeeper.serverList}'.length() > 0 and " +
        "'${spring.data.zookeeper.namespace}'.length() > 0 and " +
        "'${spring.data.zookeeper.leaderId}'.length() > 0 and " +
        "'${spring.data.zookeeper.leaderPath}'.length() > 0")
public class RegistryCenterConfig {

    @Bean(initMethod = "init")
    public ZookeeperRegistryCenter regCenter(@Value("${spring.data.zookeeper.serverList}") final String serverList,
                                             @Value("${spring.data.zookeeper.namespace}") final String namespace,
                                             @Value("${spring.data.zookeeper.leaderId}") final String leaderId,
                                             @Value("${spring.data.zookeeper.leaderPath}") final String leaderPath,
                                             @Value("${spring.data.zookeeper.enable}") final boolean enable) {

        return new ZookeeperRegistryCenter(new ZookeeperConfig(serverList, namespace, leaderId, leaderPath, enable));
    }
}