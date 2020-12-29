package com.ezfarm.donnie.zookeeper;

// https://github.com/HelloArtoo/job-scheduler/tree/master/job-scheduler-common/src/main/java/com/jd/framework/job/regcenter

import com.ezfarm.donnie.zookeeper.api.CoordinatorRegistryCenter;
import com.ezfarm.donnie.zookeeper.conf.ZookeeperConfig;
import com.ezfarm.donnie.zookeeper.exception.RegExceptionHandler;

import com.google.common.base.Charsets;
import com.google.common.base.Preconditions;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.api.ACLProvider;
import org.apache.curator.framework.recipes.cache.ChildData;
import org.apache.curator.framework.recipes.cache.TreeCache;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.curator.utils.CloseableUtils;
import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.ZooDefs;
import org.apache.zookeeper.data.ACL;
import org.apache.zookeeper.data.Stat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.Map.Entry;
import java.util.concurrent.TimeUnit;

@Slf4j
public final class ZookeeperRegistryCenter implements CoordinatorRegistryCenter {

    @Getter(AccessLevel.PROTECTED)
    private ZookeeperConfig zookeeperConfig;

    private final Map<String, TreeCache> caches = new HashMap<>();

    @Getter
    private CuratorFramework client;

    public  ZookeeperRegistryCenter(final ZookeeperConfig zookeeperConfig) {
        this.zookeeperConfig = zookeeperConfig;
    }

    private ZookeeperElectionService zookeeperElectionService;



    @Autowired
    ZookeeperElectionCandidate electionCandidate;

    public boolean isEnable()
    {
        return zookeeperConfig.isEnable();
    }

    public void initZookeeperElectionService()
    {

        if(isEnable() == false)
            return;

        log.info("initZookeeperElectionService");
        zookeeperElectionService = new ZookeeperElectionService(zookeeperConfig.getLeaderId(),
                client,
                zookeeperConfig.getLeaderPath(),
                electionCandidate);
        zookeeperElectionService.start();
    }

    public boolean hasLeadership()
    {
        //재택근무시 임시코드임: 비즈머스 172서버오류로 방어코드 추가:20080818 -  stage개발환경에서 무조건 true 리턴.
//        if ( sessionUtil.isStage() )
//            return true;
        
        if(isEnable() == false)
            return false;

        return zookeeperElectionService != null ? zookeeperElectionService.hasLeadership() : false;
    }

    // Zookeeper Session 연결 후에 아래와 같은 에러로그가 발생하지만
    //    Invalid config event received: {server.1=172.16.10.142:2888:3888:participant, version=0, server.3=0.0.0.0:2888:3888:participant, server.2=172.16.10.144:2888:3888:participant}
    // 일단 무시해도 되는 로그인 듯: https://stackoverflow.com/questions/53073051/bridge-startup-error-connecting-to-zookeeper

    @Override
    public  void init() {
        if(isEnable() == false)
            return;

        log.info("zookeeper registry center init, server lists: {}, namespace:{}, leaderId:{}, leaderPath:{}.",
                zookeeperConfig.getServerLists(),
                zookeeperConfig.getNamespace(),
                zookeeperConfig.getLeaderId(),
                zookeeperConfig.getLeaderPath());
        CuratorFrameworkFactory.Builder builder = CuratorFrameworkFactory.builder()
                .connectString(zookeeperConfig.getServerLists())
                .retryPolicy(new ExponentialBackoffRetry(zookeeperConfig.getBaseSleepTimeMilliseconds(), zookeeperConfig.getMaxRetries(), zookeeperConfig.getMaxSleepTimeMilliseconds()))
                .namespace(zookeeperConfig.getNamespace());
        if (0 != zookeeperConfig.getSessionTimeoutMilliseconds()) {
            builder.sessionTimeoutMs(zookeeperConfig.getSessionTimeoutMilliseconds());
        }
        if (0 != zookeeperConfig.getConnectionTimeoutMilliseconds()) {
            builder.connectionTimeoutMs(zookeeperConfig.getConnectionTimeoutMilliseconds());
        }
        if (!StringUtils.isEmpty(zookeeperConfig.getDigest())) {
            builder.authorization("digest", zookeeperConfig.getDigest().getBytes(Charsets.UTF_8))
                    .aclProvider(new ACLProvider() {

                        @Override
                        public  List<ACL> getDefaultAcl() {
                            return ZooDefs.Ids.CREATOR_ALL_ACL;
                        }

                        @Override
                        public  List<ACL> getAclForPath(final String path) {
                            return ZooDefs.Ids.CREATOR_ALL_ACL;
                        }
                    });
        }
        client = builder.build();
        client.start();
        try {
            if (!client.blockUntilConnected(zookeeperConfig.getMaxSleepTimeMilliseconds() * zookeeperConfig.getMaxRetries(), TimeUnit.MILLISECONDS)) {
                client.close();
                throw new KeeperException.OperationTimeoutException();
            }
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
    }

    @Override
    public  void close() {
        for (Entry<String, TreeCache> each : caches.entrySet()) {
            each.getValue().close();
        }
        waitForCacheClose();
        CloseableUtils.closeQuietly(client);
    }

    /* TODO 等待500ms, cache先关闭再关闭client, 否则会抛异常
     * 因为异步处理, 可能会导致client先关闭而cache还未关闭结束.
     * 等待Curator新版本解决这个bug.
     * BUG地址：https://issues.apache.org/jira/browse/CURATOR-157
     */
    private  void waitForCacheClose() {
        try {
            Thread.sleep(500L);
        } catch (final InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public  String get(final String key) {
        TreeCache cache = findTreeCache(key);
        if (null == cache) {
            return getDirectly(key);
        }
        ChildData resultInCache = cache.getCurrentData(key);
        if (null != resultInCache) {
            return null == resultInCache.getData() ? null : new String(resultInCache.getData(), Charsets.UTF_8);
        }
        return getDirectly(key);
    }

    private  TreeCache findTreeCache(final String key) {
        for (Entry<String, TreeCache> entry : caches.entrySet()) {
            if (key.startsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    @Override
    public  String getDirectly(final String key) {
        try {
            return new String(client.getData().forPath(key), Charsets.UTF_8);
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
            return null;
        }
    }

    @Override
    public  List<String> getChildrenKeys(final String key) {
        try {
            List<String> result = client.getChildren().forPath(key);
            Collections.sort(result, new Comparator<String>() {

                @Override
                public  int compare(final String o1, final String o2) {
                    return o2.compareTo(o1);
                }
            });
            return result;
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
            return Collections.emptyList();
        }
    }

    @Override
    public  int getNumChildren(final String key) {
        try {
            Stat stat = client.checkExists().forPath(key);
            if (null != stat) {
                return stat.getNumChildren();
            }
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
        return 0;
    }

    @Override
    public  boolean isExisted(final String key) {
        try {
            return null != client.checkExists().forPath(key);
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
            return false;
        }
    }

    @Override
    public  void persist(final String key, final String value) {
        try {
            if (!isExisted(key)) {
                client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(key, value.getBytes(Charsets.UTF_8));
            } else {
                update(key, value);
            }
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
    }

    @Override
    public  void update(final String key, final String value) {
        try {
            // https://www.javatips.net/api/org.apache.curator.framework.api.transaction.curatortransactionresult
//            client.inTransaction().check().forPath(key).and().setData().forPath(key, value.getBytes(Charsets.UTF_8)).and().commit();
            client.transactionOp().setData().forPath(key, value.getBytes(Charsets.UTF_8));
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
    }

    @Override
    public  void persistEphemeral(final String key, final String value) {
        try {
            if (isExisted(key)) {
                client.delete().deletingChildrenIfNeeded().forPath(key);
            }
            client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath(key, value.getBytes(Charsets.UTF_8));
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
    }

    @Override
    public  String persistSequential(final String key, final String value) {
        try {
            return client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT_SEQUENTIAL).forPath(key, value.getBytes(Charsets.UTF_8));
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
        return null;
    }

    @Override
    public  void persistEphemeralSequential(final String key) {
        try {
            client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL_SEQUENTIAL).forPath(key);
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
    }

    @Override
    public  void remove(final String key) {
        try {
            client.delete().deletingChildrenIfNeeded().forPath(key);
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
    }

    @Override
    public  long getRegistryCenterTime(final String key) {
        long result = 0L;
        try {
            persist(key, "");
            result = client.checkExists().forPath(key).getMtime();
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
        Preconditions.checkState(0L != result, "Cannot get registry center time.");
        return result;
    }

    @Override
    public  Object getRawClient() {
        return client;
    }

    @Override
    public  void addCacheData(final String cachePath) {
        TreeCache cache = new TreeCache(client, cachePath);
        try {
            cache.start();
            //CHECKSTYLE:OFF
        } catch (final Exception ex) {
            //CHECKSTYLE:ON
            RegExceptionHandler.handleException(ex);
        }
        caches.put(cachePath + "/", cache);
    }

    @Override
    public  void evictCacheData(final String cachePath) {
        TreeCache cache = caches.remove(cachePath + "/");
        if (null != cache) {
            cache.close();
        }
    }

    @Override
    public  Object getRawCache(final String cachePath) {
        return caches.get(cachePath + "/");
    }
}