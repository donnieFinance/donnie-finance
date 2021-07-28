package com.ezfarm.donnie.service;

import com.ezfarm.donnie.config.ComUtil;
import com.ezfarm.donnie.config.DateUtil;
import com.ezfarm.donnie.controller.CommonController;
import com.ezfarm.donnie.dataclass.UsdExchangeRawData;
import com.ezfarm.donnie.dbdata.ExContractHistory;
import com.ezfarm.donnie.dbdata.SwapErcAccount;
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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

@Slf4j
@Service
public class OpenApiService {

    @Autowired
    MongoTemplate mongoTemplate;

    @Autowired
    RestTemplate restTemplate;

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

            String newDonPrice = this.getMxcPrice("DON_USDT");

            //CMC에서 가져오기. - 202107 CMC에서 MXC가격 반영이 안되어 MXC우선으로 수정.
            if (StringUtils.isEmpty(newDonPrice)) {
                newDonPrice = this.getCmcPrice(CMC_DON_ID);
            }
//            //3줄은 coinOne에서 가져오기.(예전코드)
//            if (StringUtils.isEmpty(newDonPrice)) {
//                double donWonPrice = this.getDonWonFromCoineone();
//                double WonPerUsd = this.getLateUsdExchangeRate();
//                newDonPrice = String.valueOf(ComUtil.doubleDivide(donWonPrice, WonPerUsd)); //prev로 저장하면서 리턴.
//            }

            CommonController.prevDonPrice = newDonPrice;
            return newDonPrice;

        } catch (Exception e){
            log.error("getDonReal" + e.toString());
            return CommonController.prevDonPrice;

        } finally {
            CommonController.donProcessing = false;
        }
        //return null;
    }

    @Cacheable(value="cache10min9", key="'witchPrice'")
    public String getWitchPriceReal() {
        log.info("////////////getWichPriceReal 호출 ///////////");

        CommonController.witchProcessing = true;

        try {
            String newPrice = this.getMxcPrice("WITCH_USDT");

            CommonController.prevWitchPrice = newPrice;
            return newPrice;

        } catch (Exception e){
            log.error("getWhichReal" + e.toString());
            return CommonController.prevWitchPrice;

        } finally {
            CommonController.witchProcessing = false;
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
            return CommonController.prevIostPrice;

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
            return CommonController.prevPPTRatio ; //20210322 add.
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
            return CommonController.prevBlyPrice;
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
            return CommonController.prevBtcPrice;
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
            return CommonController.prevBnbPrice;
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

    @Cacheable(value="cache10min9", key="'witchhusdlp'")
    public String getWitchHusdPrice(String pairKey, String price, String lpTokenName) {

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

    //cache지우기 10min cache 지우는 함수 - 매 7분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min8"}, allEntries = true)
    public void removeCache10min8() {
        //log.info("cache10min7  removed");
    }

    //cache지우기 10min cache 지우는 함수 - 매 7분에 지움 : 스케쥴러에서 10분 단위로 호출. :주로 front첫화면.
    @CacheEvict(value = {"cache10min9"}, allEntries = true)
    public void removeCache10min9() {
        //log.info("cache10min7  removed");
    }

    @CacheEvict(value = {"cache30min"}, allEntries = true)
    public void removeCache30min() {
        //log.info("cache10min7  removed");
    }

    @CacheEvict(value = {"cache10sec"}, allEntries = true)
    public void removeCache10sec() {
        //log.info("cache10min7  removed");
    }



    //////////////////// 아래는 공통 함수 //////////////////////////////////////////////

    //mxc용도로 추가.
    static HttpEntity<String> publicEntity;
    static {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

        publicEntity = new HttpEntity<String>("parameters", headers);
    }


    public String getMxcPrice(String tokenSymbol) { //tokenSymbol = "DON_USDT" "WHICH_USDT" 등

        String retPrice = null;

        String resourceUrl = "https://www.mxc.co/open/api/v2/market/ticker?symbol=" + tokenSymbol
                + "&api_key=mx0dpRZzb02ZTadGIj";
        try {
            ResponseEntity<String> response = restTemplate.exchange(resourceUrl, HttpMethod.GET, publicEntity, String.class);
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode data = root.path("data");

            //data is array
            if (data.isArray()) {
                JsonNode blyData = data.get(0);

                retPrice = blyData.get("last").asText();
                log.info("mx getPrice, " + tokenSymbol + " :" + retPrice);
            }

        }catch (Exception e) {
            log.error(e.toString());
        }

        return retPrice;
    }


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


    public boolean firstSetExContractHistory() {

        for (int i = 1; i <= 25; i++) {

            setExContractHistory(String.valueOf(i));

            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                log.error(e.toString());
                return false;
            }
        }
        return true;
    }

    public boolean dailySetExContractHistory() {
        for (int i = 1; i <= 6; i++) { //하루 3천개

            setExContractHistory(String.valueOf(i));

            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                log.error(e.toString());
                return false;
            }
        }

        return true;
    }

    public boolean setExContractHistory(String pageNo)
    {
        String contractKey = "ContractL3GFG4Wo5XmpUpoJ8LctTA3VFbwTi9x9AEWDKNzg1VR";
        String vPageNo = pageNo;
        String resourceUrl = "https://www.iostabc.com/api/contract/"+contractKey+"/actions?page="+vPageNo+"&size=500";

        //header
        HttpHeaders headers = new HttpHeaders();
        headers.add("Accept", "application/json");
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {

            HttpEntity<String> httpEntity = new HttpEntity<String>("parameters", headers);

            ResponseEntity<String> response = restTemplate.exchange(resourceUrl, HttpMethod.GET, httpEntity, String.class);

            if (response.getStatusCode().value() == 200) {
                JsonNode root = mapper.readTree(response.getBody());

                JsonNode jsonActions = root.get("actions");
                if(jsonActions.size() > 0){
                    jsonActions.forEach(jsonNodeActions -> {
                        try {

                            ExContractHistory exContractHistory = new ExContractHistory();

                            String _id = jsonNodeActions.path("_id").asText();
                            String action_name = jsonNodeActions.path("action_name").asText();
                            String data = jsonNodeActions.path("data").asText();
                            String dataR = "";
                            String data1 = "";
                            String data2 = "";
                            String data3 = "";
                            String data4 = "";
                            String data5 = "";
                            String data6 = "";
                            if(!StringUtils.isEmpty(data)){
                                dataR = data.replaceAll("!\"#[$]%&\\(\\)\\{\\}@`[*]:[+];-.<>,\\^~|'\\[\\]","");
                                String dataRR = dataR.replaceAll("\"","").replaceAll("\\[","").replaceAll("\\]","");

                                String[] arrData = dataRR.split(",");

                                if(arrData.length > 0 && arrData.length == 1){
                                    data1 = arrData[0];
                                }
                                else if(arrData.length > 0 && arrData.length == 2){
                                    data1 = arrData[0];
                                    data2 = arrData[1];
                                }
                                else if(arrData.length > 0 && arrData.length == 3){
                                    data1 = arrData[0];
                                    data2 = arrData[1];
                                    data3 = arrData[2];
                                }
                                else if(arrData.length > 0 && arrData.length == 4){
                                    data1 = arrData[0];
                                    data2 = arrData[1];
                                    data3 = arrData[2];
                                    data4 = arrData[3];
                                }
                                else if(arrData.length > 0 && arrData.length == 5){
                                    data1 = arrData[0];
                                    data2 = arrData[1];
                                    data3 = arrData[2];
                                    data4 = arrData[3];
                                    data5 = arrData[4];
                                }else if(arrData.length > 0 && arrData.length == 6){
                                    data1 = arrData[0];
                                    data2 = arrData[1];
                                    data3 = arrData[2];
                                    data4 = arrData[3];
                                    data5 = arrData[4];
                                    data6 = arrData[5];
                                }
                            }
                            String block = jsonNodeActions.path("block").asText();
                            String txHash = jsonNodeActions.path("tx_hash").asText();
                            String from = jsonNodeActions.path("from").asText();

                            String created_at = jsonNodeActions.path("created_at").asText();
                            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");

                            //9시간 추가해야 정확.: gary
                            LocalDateTime createdAtDateTime = LocalDateTime.parse(created_at, formatter).plusHours(9);

                            long createdAtDateTimeLong = DateUtil.localDateTime2YyyymmddhhmmssLong(createdAtDateTime);

                            int index = jsonNodeActions.path("index").asInt();

                            String returnData = jsonNodeActions.path("return").asText();
                            String returnDataR = "";
                            if(!StringUtils.isEmpty(returnData)) {
                                returnDataR = returnData.replaceAll("!\"#[$]%&\\(\\)\\{\\}@`[*]:[+];-.<>,\\^~|'\\[\\]", "");
                                returnDataR = returnDataR.replaceAll("\"","").replaceAll("\\[","").replaceAll("\\]","").replaceAll("\\\\","");
                            }

                            String statusCode = jsonNodeActions.path("status_code").asText();

                            exContractHistory.setTxId(_id);
                            exContractHistory.setActionName(action_name);
                            exContractHistory.setData(dataR);
                            exContractHistory.setDataField1(data1);
                            exContractHistory.setDataField2(data2);
                            exContractHistory.setDataField3(data3);
                            exContractHistory.setDataField4(data4);
                            exContractHistory.setDataField5(data5);
                            exContractHistory.setDataField6(data6);
                            exContractHistory.setBlock(block);
                            exContractHistory.setTxHash(txHash);
                            exContractHistory.setContract(contractKey);
                            exContractHistory.setCreatedAt(createdAtDateTime);
                            exContractHistory.setCreatedAtLong(createdAtDateTimeLong);
                            exContractHistory.setIndex(index);
                            exContractHistory.setReturnData(returnDataR);
                            exContractHistory.setFrom(from);
                            exContractHistory.setStatusCode(statusCode);

                            mongoTemplate.save(exContractHistory,"exContractHistory");

                        } catch (IllegalArgumentException | NullPointerException e) {
                        }

                    });
                }
            }

        }catch (Exception e){
            return false;
        }

        return true;
    }

    public List<ExContractHistory> getExContractHistory(String year) {
        Criteria criteria = new Criteria();
        if(!StringUtils.isEmpty(year)){
            // 해당년도 시작일~마지막일 구하기
            LocalDateTime startDate = LocalDateTime.of(Integer.valueOf(year), 1, 1, 0,0,0);
            LocalDateTime endDate = LocalDateTime.of(Integer.valueOf(year), 12, 31, 23,59,59);
            criteria.and("createdAt").gte(startDate).lte(endDate);
        }
        Query query = new Query(criteria);
        Sort sort = Sort.by(Sort.Direction.DESC, "_id"); //Sort->Sort.by로 바뀜. springboot2.4.0
        query.with(sort);

        return mongoTemplate.find(query, ExContractHistory.class, "exContractHistory");
    }

}
