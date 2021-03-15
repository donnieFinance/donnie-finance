package com.ezfarm.donnie.controller;

import com.ezfarm.donnie.config.SecureUtil;
import com.ezfarm.donnie.dataclass.CSRTokenRes;
import com.ezfarm.donnie.service.OpenApiService;
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
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@RestController
//springboot2.4.0에서 WebConfig에서 CORS설정. @CrossOrigin(allowCredentials="true") -spring boot 2.1.5   //@CrossOrigin(origins = "*") - spring boot 2.0
public class CommonController {

    @Autowired
    OpenApiService openApiService;

    @Value("${const.cmcApiKey}")
    String cmcApiKey;




    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * 코인마켓캡에서 가격 가져오기.
     * blocery.com. AdminController에서 복사해 옴..
     */
    // not using - 밑에함수로 통일.
//    @ResponseBody
//    @GetMapping(value = "/restapi/getIostPrice")
//    public String getIostPrice() {
//
//        return openApiService.getIostPrice();
//    }


    /**
     * 코인원에서 Don 가격 USD로 가져오기. (USD는 별도 table로 환율관리)
     */
    // not using - 밑에함수로 통일.
//    @ResponseBody
//    @GetMapping(value = "/restapi/getDonPrice")
//    public String getDonPrice() {
//
//        return openApiService.getDonPrice();
//    }

    //defaultValue:서버구동시 사용.
    public static String DON_DEFAULT_PRICE = "2.5";
    public static String IOST_DEFAULT_PRICE = "0.048";
    public static String PPT_DEFAULT_RATIO = "5.2";

    public static String BLY_DEFAULT_PRICE = "0.1";


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
    public static boolean pptProcessing = false;
    public static String prevPPTRatio = CommonController.PPT_DEFAULT_RATIO;

    //get작업중이면 prev리턴.
    public synchronized String getPPTRatio() {

        if (pptProcessing)  {
            log.info("pptProcessing");
            return prevPPTRatio; //default or prev is Better
        }
        return openApiService.getPPTRatioReal();
    }

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


    /**
     * 공용 코인명으로 캐시된 코인원에서 USD로 가져오기. (USD는 별도 table로 환율관리)
     */
    @ResponseBody
    @GetMapping(value = "/restapi/getCoinUsdPrice")
    public String getCoinUsdPrice(@RequestParam String name) {

        String coinUsdPrice = "0";

        //double IOST_DEFAULT = 0.04; //20210223
        //double DEFAULT_PPT_PER_IOST = 5.2; //20210223 ppt=iost_price * PPT_PER_IOST


        try{
            if(name.equals("don")) {
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

                String iostPrice = this.getIostPrice();
                if (StringUtils.isEmpty(iostPrice)) {
                    iostPrice = IOST_DEFAULT_PRICE;
                }

                String pptIostRatio = this.getPPTRatio();

                if(!StringUtils.isEmpty(pptIostRatio)){
                    coinUsdPrice =  String.valueOf(Double.valueOf(pptIostRatio) * Double.valueOf(iostPrice));
                }else {
                    //PPT_DEFAULT_ PRICE:
                    coinUsdPrice = String.valueOf( Double.valueOf(PPT_DEFAULT_RATIO) * Double.valueOf(iostPrice) );
                }

            } if(name.startsWith("iwbly")) { //_t1 가능.
                coinUsdPrice = this.getBlyPrice();
                if (StringUtils.isEmpty(coinUsdPrice)) {
                    coinUsdPrice = BLY_DEFAULT_PRICE;
                }

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
        String ajaxResult = "";
        if(rCSRTokenRes != null) {
            ajaxResult = "HeaderName:" + rCSRTokenRes.getHeaderName() + " ParameterName:" + rCSRTokenRes.getParameterName() + " Token:" + rCSRTokenRes.getToken();
        }
        log.info("LOGIN ==setCurrentCsrfToken=== "+ajaxResult);
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

}
