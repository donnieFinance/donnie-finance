package com.ezfarm.donnie.zookeeper;

import com.ezfarm.donnie.zookeeper.api.ElectionCandidate;
import lombok.extern.slf4j.Slf4j;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.recipes.leader.LeaderSelector;
import org.apache.curator.framework.recipes.leader.LeaderSelectorListenerAdapter;
import org.apache.zookeeper.ZooKeeper;

import java.util.concurrent.CountDownLatch;

@Slf4j
public class ZookeeperElectionService {

    private final CountDownLatch countDownLatch = new CountDownLatch(1);
    private final LeaderSelector leaderSelector;

    public ZookeeperElectionService(final String identity, CuratorFramework client, final String leaderPath, final ElectionCandidate electionCandidate) {

        leaderSelector = new LeaderSelector(client, leaderPath, new LeaderSelectorListenerAdapter() {
            @Override
            public void takeLeadership(CuratorFramework client) throws Exception {
                ZooKeeper zk = client.getZookeeperClient().getZooKeeper();
                String sessionIdHexString = "0x" + Long.toHexString(zk.getSessionId());
                log.info("Job-scheduler:{} has leadership. sessionId = {}",
                        identity,
                        sessionIdHexString);
                try {
                    electionCandidate.startLeadership();
                    countDownLatch.await();
                    electionCandidate.stopLeadership();
                    log.warn("Job-scheduler:{} lost leadership. sessionId = {}",
                            identity,
                            sessionIdHexString);
                } catch (Exception e) {
                    log.error("Job-scheduler system error happened", e);
//                    System.exit(1);
                }
            }
        });
        leaderSelector.autoRequeue();
        leaderSelector.setId(identity);
    }

    public void start() {
        log.debug("Job-scheduler:{} start electing leadership", leaderSelector.getId());
        leaderSelector.start();
    }

    public void stop() {
        log.info("Job-scheduler is stopping the election");
        countDownLatch.countDown();
        try {
            leaderSelector.close();
        } catch (Exception e) {
            // ignore
        }
    }

    public boolean hasLeadership()
    {
        return leaderSelector.hasLeadership();
    }
}