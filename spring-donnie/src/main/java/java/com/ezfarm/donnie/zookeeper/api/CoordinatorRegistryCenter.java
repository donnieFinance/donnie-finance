package com.ezfarm.donnie.zookeeper.api;

import java.util.List;

public interface CoordinatorRegistryCenter extends RegistryCenter {

    String getDirectly(String key);

    List<String> getChildrenKeys(String key);

    int getNumChildren(String key);

    void persistEphemeral(String key, String value);

    String persistSequential(String key, String value);

    void persistEphemeralSequential(String key);

    void addCacheData(String cachePath);

    void evictCacheData(String cachePath);

    Object getRawCache(String cachePath);
}