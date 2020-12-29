package com.ezfarm.donnie.zookeeper;

import com.ezfarm.donnie.zookeeper.api.ElectionCandidate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ZookeeperElectionCandidate implements ElectionCandidate {


    // 리더가 되면 바로 전 리더가 정상적으로 배치작업이 돌지 않았으면 문제가 발생할 필수 배치 작업을 호출해 준다.
    // 배치 작업들은 비정상적인 상황을 대비해서 언제든 호출할 수 있도록 작성하고 한번 배치작업이 돌았던 작업은 다시 돌지 않도록 타임스탬프 관리를 한다
    public void startLeadership() throws Exception
    {
        log.info("startLeadership..");
        //adminService.setCurrentPriceOfAllValidGoodsBatch();
    }

    public void stopLeadership()
    {
        log.info("stopLeadership..");
    }
}
