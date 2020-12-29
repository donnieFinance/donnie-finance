package com.ezfarm.donnie.service;

import com.ezfarm.donnie.config.DateUtil;
import com.ezfarm.donnie.dataclass.UsdExchangeRawData;
import com.ezfarm.donnie.dbdata.UsdExchangeRate;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Slf4j
@Service
public class OpenApiService {

    @Autowired
    MongoTemplate mongoTemplate;

    @Autowired
    private ObjectMapper mapper;


    //코인원으로 부터 Don가격을 원화로 가져오기.
    public double getDonWonFromCoineone() {

        double donWonPrice = 3000.0;       //deafult 3000원.

        String resourceUrl="https://api.coinone.co.kr/ticker?currency=DON";

        log.info("/restapi/getDonPrice " );

        //header
        HttpHeaders headers = new HttpHeaders();

        HttpEntity<String> publicEntity = new HttpEntity<>("parameters", headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(resourceUrl, HttpMethod.GET, publicEntity, String.class);

        try {
            JsonNode root = mapper.readTree(response.getBody());

            double parsePrice = root.get("last").asDouble();
            log.info("parsePrice of Don:" + parsePrice);

            if (parsePrice !=0 ) {
                donWonPrice = parsePrice;
            }

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return donWonPrice;
    }



    //가장최근: 주로 어제날짜의 USD 환율 가져오기..
    public double getLateUsdExchangeRate() {

        Query query = new Query();
        Sort sort = Sort.by(Sort.Direction.DESC, "_id"); //Sort->Sort.by로 바뀜. springboot2.4.0
        query.with(sort);
        query.limit(1);

        UsdExchangeRate latest = mongoTemplate.findOne(query, UsdExchangeRate.class);

        if (latest == null) {
            return 1100.0; //default 환율
        }
        return latest.getBaseRate();
    }


    //USD 환율 정보 가져오기 BATCH. : 하루 한번 가정. - 전일의 환율을 가져옴.
    public void upsertUsdExchangeRate() {

        RestTemplate restTemplate = new RestTemplate();

        int today = DateUtil.localDate2YyyymmddInt(LocalDate.now());
        String resourceUrl = "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=raWVqrjCQEJVEZygURCSZ19prN5l9QHi&searchdate=" + today +"&data=AP01";


        try {
            ResponseEntity<String> response = restTemplate.getForEntity(resourceUrl, String.class);

            JsonNode root = mapper.readTree(response.getBody());

            log.info("root Size:" + root.size());

            for (int i = root.size() - 1;  i >= 0; i--) {

                UsdExchangeRawData oneRawData = mapper.convertValue(root.get(i), UsdExchangeRawData.class);

                if ("USD".equals(oneRawData.getCur_unit())) { //달러환율 발견.

                    log.info("deal_bas_r:" + oneRawData.getDeal_bas_r());
                    log.info("bkpr:" + oneRawData.getBkpr());


                    //DB에 저장..
                    UsdExchangeRate oneRate = new UsdExchangeRate();
                    oneRate.setDay(today);
                    oneRate.setBaseRate( Double.valueOf(oneRawData.getDeal_bas_r().replaceAll(",","")));
                    oneRate.setBaseIntRate( Integer.valueOf(oneRawData.getBkpr().replaceAll(",","")));

                    mongoTemplate.save(oneRate);
                    break;
                }
            }

        }catch (IOException e) {
            e.printStackTrace();

        }
        log.info("///////////////////upsert UsdExchangeRate DONE////////////////////////");
    }


}
