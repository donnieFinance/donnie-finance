package com.ezfarm.donnie.controller;

import com.ezfarm.donnie.config.ComUtil;
import com.ezfarm.donnie.config.SecureUtil;
import com.ezfarm.donnie.config.SessionUtil;
import com.ezfarm.donnie.dataclass.CSRTokenRes;
import com.ezfarm.donnie.dataclass.ImageData;
import com.ezfarm.donnie.service.IostService;
import com.ezfarm.donnie.service.OpenApiService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.*;

@Slf4j
@RestController
//springboot2.4.0에서 WebConfig에서 CORS설정. @CrossOrigin(allowCredentials="true") -spring boot 2.1.5   //@CrossOrigin(origins = "*") - spring boot 2.0
public class CommonController {

    @Autowired
    OpenApiService openApiService;

    @Autowired
    IostService iostService;

    @Autowired
    SessionUtil sessionUtil;

    @Value("${const.cmcApiKey}")
    String cmcApiKey;




    //////////////////////////////////////////////////////////////////////////////////////



    //호출횟수 감소용 새로 추가. - 20210322
    @ResponseBody
    @GetMapping(value = "/restapi/getAllCoinUsdPrice")
    public Map<String, String> getAllCoinUsdPrice() {

        Map<String, String> priceMap = new HashMap<>();

        //전체 코인별 가격, 하나씩 조회해서 추가.
        // "don": "0.5"
        // "husd": "1.0"
        //... 형태로 모두 추가.

        for (String coinName : ALL_COIN_NAME) {

            priceMap.put(coinName, getCoinUsdPrice(coinName));
        }

        return priceMap;
    }

    /////총 7개 coin + x개 LP 관리 중.//////////////
    public static List<String> ALL_COIN_NAME = Arrays.asList("iwavax", "iwcoops", "iwtvs", "don", "iost", "ppt", "husd", "iwbly", "iwbtc", "iwbnb", "iwwitch","donhusdlp", "iosthusdlp", "doniostlp", "bnbhusdlp", "witchhusdlp", "zunahusdlp");


    //Donnie_DEX_Price용. (husd는 미사용- 개수맞춤용으로 추가) //TODO  FRONT의 properties.exchange.tokenList  EXCHANGE_COIN_NAME 순서와 개수가 같아야 함.
    public static List<String> EXCHANGE_COIN_NAME = Arrays.asList("don", "iost", "husd", "iwbnb", "iwwitch", "zuna");


    /**
     * 코인마켓캡에서 가격 가져오기.
     */
    // not using - 밑에함수로 통일.
//    @GetMapping(value = "/restapi/getIostPrice")
//    @GetMapping(value = "/restapi/getDonPrice")



    //defaultValue:서버구동시 사용. front에선 properties.js/////////////////////////////

    public static String DON_DEFAULT_PRICE = "0.102";
    public static String IOST_DEFAULT_PRICE = "0.015";
    public static String BLY_DEFAULT_PRICE = "0.010";
    public static String BTC_DEFAULT_PRICE = "22000";
    public static String BNB_DEFAULT_PRICE = "250";
    public static String AVAX_DEFAULT_PRICE = "20.5";

    public static String WITCH_DEFAULT_PRICE = "0.295";
    public static String ZUNA_DEFAULT_PRICE = "0.025";

    public static String COOPS_DEFAULT_PRICE = "48";
    public static String TVS_DEFAULT_PRICE = "12"; //TODO ALL_COIN_NAME에도 iwtvs 추가해야함.가격때문에.



//    public static String PPT_DEFAULT_RATIO = "6.2";

    ////코인 가격들 local 캐시 한번 더 함.//////////////////////////////////////////////////////////////////

    /////////don ////////////////
    public static boolean donProcessing = false;
    public static String prevDonPrice = CommonController.DON_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getDonPrice() {

        if (donProcessing)  {
            log.info("donProcessing");
            return prevDonPrice; //default or prev is Better
        }

        //log.info("////////////getDonPriceReal 호출 ///////////");
        return openApiService.getDonPriceReal();
    }

    /////////iost ////////////////
    public static boolean iostProcessing = false;
    public static String prevIostPrice = CommonController.IOST_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getIostPrice() {

        if (iostProcessing)  {
            log.info("iostProcessing");
            return prevIostPrice; //default or prev is Better
        }
        return openApiService.getIostPriceReal();
    }

    /////////ppt ////////////////
//    public static boolean pptProcessing = false;
//    public static String prevPPTRatio = CommonController.PPT_DEFAULT_RATIO;

    //get작업중이면 prev리턴.
//    public synchronized String getPPTRatio() {
//
//        if (pptProcessing)  {
//            //log.info("pptProcessing");
//            return prevPPTRatio; //default or prev is Better
//        }
//        return openApiService.getPPTRatioReal();
//    }

    /////////bly ////////////////
    public static boolean blyProcessing = false;
    public static String prevBlyPrice = CommonController.BLY_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getBlyPrice() {

        if (blyProcessing)  {
            log.info("blyProcessing");
            return prevBlyPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getBlyPriceReal();
    }

    /////////btc ////////////////
    public static boolean btcProcessing = false;
    public static String prevBtcPrice = CommonController.BTC_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getBtcPrice() {

        if (btcProcessing)  {
            log.info("btcProcessing");
            return prevBtcPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getBtcPriceReal();
    }

    /////////bnb ////////////////
    public static boolean bnbProcessing = false;
    public static String prevBnbPrice = CommonController.BNB_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getBnbPrice() {

        if (bnbProcessing)  {
            log.info("bnbProcessing");
            return prevBnbPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getBnbPriceReal();
    }

    /////////avax ////////////////
    public static boolean avaxProcessing = false;
    public static String prevAvaxPrice = CommonController.AVAX_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getAvaxPrice() {

        if (avaxProcessing)  {
            log.info("avaxProcessing");
            return prevAvaxPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getAvaxPriceReal();
    }

    /////////coops ////////////////
    public static boolean coopsProcessing = false;
    public static String prevCoopsPrice = CommonController.COOPS_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getCoopsPrice() {

        if (coopsProcessing)  {
            log.info("coopsProcessing");
            return prevCoopsPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getCoopsPriceReal();
    }
    /////////TVS ////////////////
    public static boolean tvsProcessing = false;
    public static String prevTvsPrice = CommonController.TVS_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getTvsPrice() {

        if (tvsProcessing)  {
            log.info("tvsProcessing");
            return prevTvsPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getTvsPriceReal();
    }



    /////////witch ////////////////
    public static boolean witchProcessing = false;
    public static String prevWitchPrice = CommonController.WITCH_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getWitchPrice() {

        if (witchProcessing)  {
            log.info("witchProcessing");
            return prevWitchPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getWitchPriceReal();
    }

    /////////zuna ////////////////
    public static boolean zunaProcessing = false;
    public static String prevZunaPrice = CommonController.ZUNA_DEFAULT_PRICE;

    //get작업중이면 prev리턴.
    public synchronized String getZunaPrice() {

        if (zunaProcessing)  {
            log.info("zunaProcessing");
            return prevZunaPrice; //default or prev is Better
        }

        //log.info("////////////getBlyPriceReal 호출 ///////////");
        return openApiService.getZunaPriceReal();
    }

    /**
     * 공용 코인명으로 캐시된 코인원에서 USD로 가져오기. (USD는 별도 table로 환율관리)
     *
     * 미사용 예정. -> 캐시들 제거기간 거친후 block예정.
     */
//    @ResponseBody
//    @GetMapping(value = "/restapi/getCoinUsdPrice")
//    public String getCoinUsdPriceApi(@RequestParam String name) {
//
//        return getCoinUsdPrice(name);
//    }


    private String getCoinUsdPrice(String name) {

        String coinUsdPrice = "0";

        //double IOST_DEFAULT = 0.04; //20210223
        //double DEFAULT_PPT_PER_IOST = 5.2; //20210223 ppt=iost_price * PPT_PER_IOST


        try{
            if (name.equals("iwwitch")){

                coinUsdPrice = this.getWitchPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = WITCH_DEFAULT_PRICE;
                }

            } else if(name.equals("zuna")) {
                coinUsdPrice = this.getZunaPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = ZUNA_DEFAULT_PRICE;
                }

            } else if(name.equals("don")) {
                coinUsdPrice = this.getDonPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = DON_DEFAULT_PRICE;
                }

            } else if(name.equals("iost")) {
                coinUsdPrice = this.getIostPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = IOST_DEFAULT_PRICE;
                }

            } else if(name.equals("husd")) {
                coinUsdPrice = "1.0";
            } else if(name.equals("ppt")) {

                coinUsdPrice = "0.2"; //not using. bu fast return.

                //ppt closed.
//                String iostPrice = this.getIostPrice();
//                if (StringUtils.isEmpty(iostPrice)) {
//                    iostPrice = IOST_DEFAULT_PRICE;
//                }
//
//                String pptIostRatio = this.getPPTRatio();
//
//                if(!StringUtils.isEmpty(pptIostRatio)){
//                    coinUsdPrice =  String.valueOf(Double.valueOf(pptIostRatio) * Double.valueOf(iostPrice));
//                }else {
//                    //PPT_DEFAULT_ PRICE:
//                    coinUsdPrice = String.valueOf( Double.valueOf(PPT_DEFAULT_RATIO) * Double.valueOf(iostPrice) );
//                }

            }else if(name.startsWith("iwbly")) { //_t1 가능.
                coinUsdPrice = this.getBlyPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = BLY_DEFAULT_PRICE;
                }
            }else if(name.startsWith("iwbtc")) { //_t1 가능.
                coinUsdPrice = this.getBtcPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = BTC_DEFAULT_PRICE;
                }
            }else if(name.startsWith("iwbnb")) { //_t1 가능.
                coinUsdPrice = this.getBnbPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = BNB_DEFAULT_PRICE;
                }

            }else if(name.startsWith("iwavax")) { //_t1 가능.
                coinUsdPrice = this.getAvaxPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = AVAX_DEFAULT_PRICE;
                }
            }else if(name.startsWith("iwcoops")) { //_t1 가능.
                coinUsdPrice = this.getCoopsPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = COOPS_DEFAULT_PRICE;
                }
            }else if(name.startsWith("iwtvs")) { //_t1 가능.
                coinUsdPrice = this.getTvsPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = TVS_DEFAULT_PRICE;
                }

            }else { ///LP 토큰들 가격 추정.///////////////////////////////
                if (sessionUtil.isStage()) { //stage는 로그만 찍음
                    name = name.replaceAll("lp$", "tt");
                    //log.info("stage - lptoken name:" + name);
                }

                if(name.startsWith("zunahusd")) {

                    String pairKey = "zuna_husd";
                    String zunaPrice = this.getZunaPrice();

                    if (Boolean.TRUE == OpenApiService.lpHusdInProcessing.get(pairKey)) { //caching 안되게 하려고 여기서 processing체크.
                        return OpenApiService.lpHusdPrev.containsKey(pairKey)? OpenApiService.lpHusdPrev.get(pairKey) : "1.0";
                    }

                    //lp AmountData(don:100, husd:300), supply 600개이면
                    //donAD * donPrice + husdAD / 600 공식.
                    String lpPrice =  openApiService.getZunaHusdPrice(pairKey, zunaPrice, name);
                    //log.info("lpPrice:" + lpPrice + ", name:" + name);

                    return lpPrice;
                }

                if(name.startsWith("donhusd")) {

                    String pairKey = "don_husd";
                    String donPrice = this.getDonPrice();

                    if (Boolean.TRUE == OpenApiService.lpHusdInProcessing.get(pairKey)) { //caching 안되게 하려고 여기서 processing체크.
                        return OpenApiService.lpHusdPrev.containsKey(pairKey)? OpenApiService.lpHusdPrev.get(pairKey) : "1.0";
                    }

                    //lp AmountData(don:100, husd:300), supply 600개이면
                    //donAD * donPrice + husdAD / 600 공식.
                    String lpPrice =  openApiService.getDonHusdPrice(pairKey, donPrice, name);
                    //log.info("lpPrice:" + lpPrice + ", name:" + name);

                    return lpPrice;
                }
                if(name.startsWith("iosthusd")) {

                    String pairKey = "iost_husd";
                    String iostPrice = this.getIostPrice();

                    if (Boolean.TRUE == OpenApiService.lpHusdInProcessing.get(pairKey)) { //caching 안되게 하려고 여기서 processing체크.
                        return OpenApiService.lpHusdPrev.containsKey(pairKey)? OpenApiService.lpHusdPrev.get(pairKey) : "1.0";
                    }

                    String lpPrice = openApiService.getIostHusdPrice(pairKey, iostPrice, name);
                    //log.info("lpPrice:" + lpPrice + ", name:" + name);

                    return lpPrice;
                }
                if(name.startsWith("bnbhusd")) {

                    String pairKey = "iwbnb_husd";
                    String bnbPrice = this.getBnbPrice();

                    if (Boolean.TRUE == OpenApiService.lpHusdInProcessing.get(pairKey)) { //caching 안되게 하려고 여기서 processing체크.
                        return OpenApiService.lpHusdPrev.containsKey(pairKey)? OpenApiService.lpHusdPrev.get(pairKey) : "1.0";
                    }

                    String lpPrice = openApiService.getBnbHusdPrice(pairKey, bnbPrice, name);
                    //log.info("lpPrice:" + lpPrice + ", name:" + name);

                    return lpPrice;
                }
                //token_token LP의 경우 - 향후 추가 안될확률이 높아서 lplp로 변수명 설정.
                if(name.startsWith("doniost")) {

                    String pairKey = "don_iost";
                    String donPrice = this.getDonPrice();
                    String iostPrice = this.getIostPrice();

                    if (OpenApiService.lpLpInProcessing) { //caching 안되게 하려고 여기서 processing체크.
                        return OpenApiService.lpLpPrev;
                    }

                    String lpPrice = openApiService.getDonIostPrice(pairKey, donPrice, iostPrice, name);
                    //log.info("lpPrice:" + lpPrice + ", name:" + name);

                    return lpPrice;
                }
                if(name.startsWith("witchhusd")) { //which liquidity 전용 (checking에선 안씀)

                    String pairKey = "iwwitch_husd";
                    String witchPrice = this.getWitchPrice();

                    if (OpenApiService.lpLpInProcessing) { //caching 안되게 하려고 여기서 processing체크.
                        return OpenApiService.lpLpPrev;
                    }

                    String lpPrice = openApiService.getWitchHusdPrice(pairKey, witchPrice, name);
                    //log.info("lpPrice:" + lpPrice + ", name:" + name);

                    return lpPrice;
                }

                return "1.0"; //LP토큰들 기본가격 1.0 달러.
            }


        }catch (Exception e){
            e.printStackTrace();
            log.error(e.toString());
            return coinUsdPrice;
        }

        return coinUsdPrice;
    }


    //부하유발 가능해서 cache 로 대체.
//    /**
//     * 코인마켓캡에서 가격 가져오기.
//     * blocery.com. AdminController에서 복사해 옴..
//     */
//    @ResponseBody
//    @GetMapping(value = "/restapi/getCmcPrice")
//    public String getCmcPrice(@RequestParam("id") int id) {
//
//       return openApiService.getCmcPrice(id);// not cached.
//    }

//    @Autowired
//    ApplicationAvailability availability;

    public static boolean isServerRunning = true;
    //springboot 2.4.0 기능사용으로 항상 200 OK리턴.
    @ResponseBody
    @GetMapping(value = "/restapi/awsHealth")
    public ResponseEntity getHealth() {


        if (isServerRunning) {
            return new ResponseEntity(HttpStatus.OK); //항상 200 OK return,
        }

        //graceFulShutdownEventListener 시작되면 503리턴.
        log.info("CommonController: graceFulShutdownEventListener started");

        return new ResponseEntity(HttpStatus.NOT_ACCEPTABLE);
    }


    /**
     * RedirectController
     * /restapi/를 제외한
       모든 react 웹페이지를 index.html로 이동해서 react로직을 태움
     */
    @RequestMapping(value = {
            "/",    // root
            "/{x:[\\w\\-]+}",   // ex \foo
            "/{x:^(?!restapi$).*$}/**/{y:[\\w\\-]+}"
    })
//    @RequestMapping(value = {
//            "/",
//            "/savings/**",
//            "/loan/**",
//            "/exchange/**",
//            "/creditScore/**",
//            "/card/**",
//            "/fundManagement/**",
//    })
    public ModelAndView redirect(HttpServletRequest request) {
        log.debug("redirect:" + request.getRequestURL().toString() + "?" + request.getQueryString());
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("forward:/index.html");
        return modelAndView;
    }


//    //서버의 날짜 조회 함수 : Front-End에서 취소수수료 계산시에 사용.
//    @ResponseBody
//    @GetMapping(value = "/restapi/common/today")
//    public String getToday() {
//
//        String today = ComUtil.getToday();
//        log.info("Server today:" + today);
//        return today;
//    }



    // CSRF 서버 토큰 생성
    @RequestMapping("/restapi/setCsrfToken")
    public void setCsrfToken()  {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        CsrfToken rCSRTokenRes = SecureUtil.setCurrentCsrfToken(attr.getRequest());
//        String ajaxResult = "";
//        if(rCSRTokenRes != null) {
//            ajaxResult = "HeaderName:" + rCSRTokenRes.getHeaderName() + " ParameterName:" + rCSRTokenRes.getParameterName() + " Token:" + rCSRTokenRes.getToken();
//        }
        //log.info("LOGIN ==setCurrentCsrfToken=== "+ajaxResult);
    }

    /*
        Controller 에서 사용법
         1. HttpServletRequest req
         2. 실제처리부분에 아래 부분 추가
            // request Ajax Header['X-CSRF-TOKEN'] 토큰값 :: 로그인시 토큰값 변경됨..
            boolean bCsrfToken = SecureUtil.compareCsrfToken(req);
            if(bCsrfToken){
              //정상적인 처리
            }
    */
    // 현재 CSRF Ajax 사용할 토큰
    @RequestMapping(value = "/restapi/getCsrfToken", method={RequestMethod.GET, RequestMethod.POST})
    public String getCsrfTokenAjaxSend(HttpServletRequest request)  {
        // front end 에 넘길 토큰 값
        CSRTokenRes rCSRTokenRes = SecureUtil.getAjaxCsrfToken(request);
        if(rCSRTokenRes != null){
            return rCSRTokenRes.getToken();
        }
        return null;
    }


    //Exchane swap메뉴용 DEX토큰들 가격 가져오기
    @ResponseBody
    @GetMapping(value = "/restapi/getAllDonnieDexPrice")
    public List<String> getAllDonnieDexPrice() {

        ArrayList<String> priceList = new ArrayList<>();

        //전체 코인별 가격, 하나씩 조회해서 추가.
        // "don": "0.5"
        // "husd": "1.0"
        //... 형태로 모두 추가.

        for (String coinName : EXCHANGE_COIN_NAME) {

            priceList.add(getDonnieDexPrice(coinName));
        }

        return priceList;
    }


    //token_husd pair상 가격 조회. amountData가 [100,100] 이면 1달러. [200,100] 이면 $0.500 리턴.
    public String getDonnieDexPrice(String coinName) {
        if (coinName.equals("husd")) {
            return "...";//loading.."; //husd가격은 미사용.
        }

        try {
            String[] amountData = iostService.getLpPairAmountData(coinName + "_husd");

            double price3 = ComUtil.doubleDivide3(Double.valueOf(amountData[1]), Double.valueOf(amountData[0]));

            //log.info("getDonnieDexPrice:" + coinName + "," + price3);
            return "$" + price3;

        }catch (Exception e) {
            return "...";//loading..";
        }
    }

}
