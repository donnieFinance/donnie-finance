package com.ezfarm.donnie.service;

import com.ezfarm.donnie.config.ComUtil;
import com.ezfarm.donnie.config.DateUtil;
import com.ezfarm.donnie.controller.CommonController;
import com.ezfarm.donnie.dataclass.UsdExchangeRawData;
import com.ezfarm.donnie.dbdata.UsdExchangeRate;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonArray;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
import java.util.HashMap;

@Slf4j
@Service
public class OpenApiService {

    @Autowired
    MongoTemplate mongoTemplate;

    @Autowired
    IostService iostService;

    @Autowired
    private ObjectMapper mapper;

    @Value("${const.cmcApiKey}")
    String cmcApiKey;

    //CMC coinID: coinKey
    private int CMC_DON_ID = 8814;
    private int CMC_BNB_ID = 1839;
    private int CMC_BTC_ID = 1;

//    private int CMD_ETH_ID = 1027;
//    private int CMD_BLY_ID = 6283;
//    private int CMD_IOST_ID = 2405;


    /////////// 간단 cache 기능 ////////////////////////////////////////
    @Cacheable(value="cache10min1", key="'donPrice'")
    public String getDonPriceReal() {
        log.info("////////////getDonPriceReal 호출 ///////////");

        CommonController.donProcessing = true;

        try {
            //CMC에서 가져오기.
            String newDonPrice = this.getCmcPrice(CMC_DON_ID);

            if (StringUtils.isEmpty(newDonPrice)) {
                //3줄은 coinOne에서 가져오기.
                double donWonPrice = this.getDonWonFromCoineone();
                double WonPerUsd = this.getLateUsdExchangeRate();
                newDonPrice = String.valueOf(ComUtil.doubleDivide(donWonPrice, WonPerUsd)); //prev로 저장하면서 리턴.
            }


            CommonController.prevDonPrice = newDonPrice;
            return newDonPrice;

        } catch (Exception e){
            log.error("getDonReal" + e.toString());
            return null;

        } finally {
            CommonController.donProcessing = false;
        }
        //return null;
    }

    @Cacheable(value="cache10min6", key="'iostPrice'")
    public String getIostPriceReal() {
        CommonController.iostProcessing = true; //1
        try {
            String iostPrice = this.getCmcPrice(2405);

            log.info("getIostPrice Caching:" + iostPrice);

            CommonController.prevIostPrice = iostPrice; //2
            return iostPrice;

        } catch (Exception e){
            log.error("getIostPriceReal:" + e.toString());
            return null;
        } finally {
            CommonController.iostProcessing = false; //3
        }
        //return null;
    }

    @Cacheable(value="cache10min3", key="'pptPrice'")
    public String getPPTRatioReal() {
        CommonController.pptProcessing = true;

        String retPrice = null;

        String resourceUrl="https://otbtrade.com/api/getCurrentTx/ppt";
        //log.info("getPPTPrice==");
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        //headers.add("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36");
        headers.add("user-agent", "Application");
        HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(resourceUrl, HttpMethod.GET, entity, String.class);
        //log.info("getPPTPrice=response2=",response);
        //가격 파싱 추가////////
        try {
            JsonNode root = mapper.readTree(response.getBody());
            double parsePrice = root.get("price").asDouble();
            log.info("getPPTPrice:" + parsePrice);
            retPrice = String.valueOf(parsePrice);

            CommonController.prevPPTRatio = retPrice;
            return retPrice;

        } catch (Exception e) {
            log.error("getPPTRatioReal:" + e.toString());
            return null; //20210322 add.
        } finally {
            CommonController.pptProcessing = false;
        }
        //return null;
    }


    @Cacheable(value="cache10min4", key="'blyPrice'")
    public String getBlyPriceReal() {
        CommonController.blyProcessing = true; //1
        try {
            String blyPrice = this.getCmcPrice(6283); //BLY코드: BLY_ID = "6283";

            log.info("getBlyPriceReal Caching:" + blyPrice);

            CommonController.prevBlyPrice = blyPrice; //2
            return blyPrice;

        } catch (Exception e){
            log.error("getBlyPriceReal:" + e.toString());
            return null;
        } finally {
            CommonController.blyProcessing = false; //3
        }
        //return null;
    }

    @Cacheable(value="cache10min5", key="'btcPrice'")
    public String getBtcPriceReal() {
        CommonController.btcProcessing = true; //1
        try {
            String price = this.getCmcPrice(CMC_BTC_ID);

            log.info("getBtcPriceReal Caching:" + price);

            CommonController.prevBtcPrice = price; //2
            return price;

        } catch (Exception e){
            log.error("getBtcPriceReal:" + e.toString());
            return null;
        } finally {
            CommonController.btcProcessing = false; //3
        }
        //return null;
    }

    @Cacheable(value="cache10min2", key="'bnbPrice'")
    public String getBnbPriceReal() {
        CommonController.bnbProcessing = true; //1
        try {
            String price = this.getCmcPrice(CMC_BNB_ID);

            log.info("getBnbPriceReal Caching:" + price);

            CommonController.prevBnbPrice = price; //2
            return price;

        } catch (Exception e){
            log.error("getBnbPriceReal:" + e.toString());
            return null;
        } finally {
            CommonController.bnbProcessing = false; //3
        }
        //return null;
    }


    //////////LP토큰 가격 추정///////////////////////////////

    //donhusdlp price
    @Cacheable(value="cache10min3", key="'donhusdlp'")
    public String getDonHusdPrice(String pairKey, String price, String lpTokenName) {

        String ret = getLpHusdPrice(pairKey,price,lpTokenName);
        lpHusdPrev.put(pairKey, ret);

        return ret;
    }

    @Cacheable(value="cache10min1", key="'iosthusdlp'")
    public String getIostHusdPrice(String pairKey, String price, String lpTokenName) {

        String ret = getLpHusdPrice(pairKey,price,lpTokenName);
        lpHusdPrev.put(pairKey, ret);

        return ret;
    }

    @Cacheable(value="cache10min5", key="'doniostlp'")
    public String getDonIostPrice(String pairKey, String price1, String price2, String lpTokenName) {

        String ret = getLpLpPrice(pairKey,price1,price2,lpTokenName);
        lpLpPrev = ret;

        return ret;
    }

    @Cacheable(value="cache10min7", key="'bnbhusdlp'")
    public String getBnbHusdPrice(String pairKey, String price, String lpTokenName) {

        String ret = getLpHusdPrice(pairKey,price,lpTokenName);
        lpHusdPrev.put(pairKey, ret);

        return ret;
    }


    //lpValue의 상태 및 이전값 관리
    public static HashMap<String, Boolean> lpHusdInProcessing = new HashMap<>();
    public static HashMap<String, String> lpHusdPrev = new HashMap<>();


    //lp_husd가격 산출,.  AmountData(don:100, husd:300), supply 600개이면
    //donAD * donPrice + husdAD / 600 공식.
    private String getLpHusdPrice(String pairKey, String price, String lpTokenName) {

        lpHusdInProcessing.put(pairKey, true);

        try {
            String[] amountData = iostService.getLpPairAmountData(pairKey);
            String token1Ad = amountData[0];
            String husdAd = amountData[1];

            String supply = iostService.getTokenCurrentSupply(lpTokenName);

            return String.valueOf(ComUtil.roundDown2((Double.valueOf(token1Ad) * Double.valueOf(price) + Double.valueOf(husdAd)) / Double.valueOf(supply))) ;

        }catch (Exception e) {
            log.error(e.toString());
        }finally {
            lpHusdInProcessing.put(pairKey, false);
        }

        return "1.0"; //default
    }


    //doniostlp 전용 함수.
    public static boolean lpLpInProcessing = false;
    public static String lpLpPrev = "1.0";

    //don_iost가격 산출,.  AmountData(don:10, iost:600), supply 600개이면
    //donAD * donPrice + iostAD * iostPrice / 600 공식.
    private String getLpLpPrice(String pairKey, String price1, String price2, String lpTokenName) {

        lpLpInProcessing = true;

        try {
            String[] amountData = iostService.getLpPairAmountData(pairKey);

            String token1Ad = amountData[0];
            String token2Ad = amountData[1];

            String supply = iostService.getTokenCurrentSupply(lpTokenName);

            return String.valueOf(ComUtil.roundDown2((Double.valueOf(token1Ad) * Double.valueOf(price1) + Double.valueOf(token2Ad) * Double.valueOf(price2) ) / Double.valueOf(supply))) ;

        }catch (Exception e) {
            log.error(e.toString());
        }finally {
            lpLpInProcessing=false;
        }

        return "1.0"; //default
    }



//    //cache지우기 10분 배치 함수. - 7개로 분리.
//    @CacheEvict(value = { "cache10min_donPrice", "cache10min_iostPrice" }, allEntries = true)
//    public void removeCache10min(){
//        log.info("cache10min  removed");
//    }


    //cache지우기 10min cache 지우는 함수 - 매 1분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min1"}, allEntries = true)
    public void removeCache10min1() {
        log.info("cache10min1  removed");
    }

    //cache지우기 10min cache 지우는 함수 - 매 2분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min2"}, allEntries = true)
    public void removeCache10min2() {
        //log.info("cache10min2  removed");
    }

    //cache지우기 10min cache 지우는 함수 - 매 2분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min3"}, allEntries = true)
    public void removeCache10min3() {
        //log.info("cache10min3  removed");
    }


    //cache지우기 10min cache 지우는 함수 - 매 4분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min4"}, allEntries = true)
    public void removeCache10min4() {
        //log.info("cache10min4  removed");
    }

    //cache지우기 10min cache 지우는 함수 - 매 5분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min5"}, allEntries = true)
    public void removeCache10min5() {
        //log.info("cache10min5  removed");
    }

    //cache지우기 10min cache 지우는 함수 - 매 6분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min6"}, allEntries = true)
    public void removeCache10min6() {
        //log.info("cache10min6  removed");
    }

    //cache지우기 10min cache 지우는 함수 - 매 7분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min7"}, allEntries = true)
    public void removeCache10min7() {
        //log.info("cache10min7  removed");
    }


    @CacheEvict(value = {"cache30min"}, allEntries = true)
    public void removeCache30min() {
        //log.info("cache10min7  removed");
    }




    //////////////////// 아래는 공통 함수 //////////////////////////////////////////////

    //coinKey조회: https://pro-api.coinmarketcap.com/v1/cryptocurrency/map 로 전체 토큰key 조회 가능.
    //BTC = 1
    //BNB = 1839
    //DON = 8814

    public String getCmcPrice(int id) {

        String retPrice = null;

        String resourceUrl="https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=" + id;

        log.info("/restapi/getCmcPrice: " + id + ", apiKey:" + cmcApiKey);
        //header
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-CMC_PRO_API_KEY", cmcApiKey);

        HttpEntity<String> publicEntity = new HttpEntity<>("parameters", headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(resourceUrl, HttpMethod.GET, publicEntity, String.class);

        //가격 파싱 추가////////
        try {
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode data = root.path("data");

            //data(2405).quote.USD.price;
            JsonNode coinData = data.get(String.valueOf(id));  //data(2405). quote.USD.price;
            JsonNode quote = coinData.get("quote");
            JsonNode usd = quote.get("USD");

            retPrice = usd.get("price").asText();  //data(2405). quote.USD.price;

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return retPrice;
    }


    //코인원으로 부터 Don가격을 원화로 가져오기.
    public double getDonWonFromCoineone() {

        double donWonPrice = 3000.0;       //deafult 3000원.

        String resourceUrl="https://api.coinone.co.kr/ticker?currency=DON";


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

        log.info("/restapi/getCoinUsdPrice - coinone DON WON: " + donWonPrice );
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
