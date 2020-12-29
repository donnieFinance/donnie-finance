package com.ezfarm.donnie.config;

import com.ezfarm.donnie.service.OpenApiService;
import com.ezfarm.donnie.zookeeper.ZookeeperRegistryCenter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


@Component
@Slf4j
@EnableScheduling
public class Scheduler {

    @Autowired
    ZookeeperRegistryCenter regCenter;

    @Autowired
    OpenApiService openApiService;

    // 리더가 되면 바로 전 리더가 정상적으로 배치작업이 돌지 않았으면 문제가 발생할 필수 배치 작업을 호출해 준다.
    // 배치 작업들은 비정상적인 상황을 대비해서 언제든 호출할 수 있도록 작성하고 한번 배치작업이 돌았던 작업은 다시 돌지 않도록 타임스탬프 관리를 한다

    // cron 설정법
    // https://kanetami.tistory.com/entry/Schedule-Spring-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8A%A4%EC%BC%80%EC%A5%B4-%EC%84%A4%EC%A0%95%EB%B2%95-CronTab
//    @Scheduled(cron="0 * * * * ?")  // 매분 테스트코드
//    @Scheduled(cron="0 4 0 * * ?")  // 매일 0시 4분.


//    @Scheduled(cron="0 * * * * ?") //(매분 테스트)
//    @Scheduled(cron="* * * * * ?") //(매초 테스트)

    @Scheduled(cron="0 57 23 * * ?")  // 매일 23시 57분에 당일종가 환율 가져오기
    public void getUsdExchangeRateAndBlyUsd()
    {
        if(regCenter.hasLeadership()) {
            log.info("##### start batch process: upsertUsdExchangeRate");

            //환율 저장하기.
            openApiService.upsertUsdExchangeRate();

            log.info("##### end batch process: upsertUsdExchangeRate");
        }
    }

    @Scheduled(cron="1,31 * * * * ?")  // 매일 매분 1초,31초
    public void batchScheduleTest()
    {
        log.info("#in Scheduler: batchSchedule");

        if(regCenter.hasLeadership()) {
            log.info("##### start batch process: batchSchedule");

            //swapService.blabla();

            log.info("##### end batch process: batchSchedule");
        }
    }

}