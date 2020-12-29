package com.ezfarm.donnie.zookeeper.api;

public interface ElectionCandidate {
    void startLeadership() throws Exception;
    void stopLeadership();
}
