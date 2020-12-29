package com.ezfarm.donnie.zookeeper.conf;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public final class ZookeeperConfig {

    private final String serverLists;

    private final String namespace;

    private final String leaderId;

    private final String leaderPath;

    private final boolean enable;

    private int baseSleepTimeMilliseconds = 1000;

    private int maxSleepTimeMilliseconds = 3000;

    private int maxRetries = 10;

    private int sessionTimeoutMilliseconds;

    private int connectionTimeoutMilliseconds;

    private String digest;
}