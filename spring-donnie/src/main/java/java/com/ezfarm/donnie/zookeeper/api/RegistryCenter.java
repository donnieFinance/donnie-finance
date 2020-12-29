package com.ezfarm.donnie.zookeeper.api;

public interface RegistryCenter {

    void init();

    void close();

    String get(String key);

    boolean isExisted(String key);

    void persist(String key, String value);

    void update(String key, String value);

    void remove(String key);

    long getRegistryCenterTime(String key);

    Object getRawClient();
}