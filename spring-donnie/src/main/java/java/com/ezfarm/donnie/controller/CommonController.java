package com.ezfarm.donnie.controller;

import com.ezfarm.donnie.config.ComUtil;
import com.ezfarm.donnie.service.OpenApiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
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

    /**
     * 코인마켓캡에서 가격 가져오기.
     * blocery.com. AdminController에서 복사해 옴..
     */
    @ResponseBody
    @GetMapping(value = "/restapi/getCmcPrice")
    public ResponseEntity<String> getCmcPrice(@RequestParam("id") int id) {

        String resourceUrl="https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=" + id;

        log.info("/restapi/getCmcPrice: " + id + ", apiKey:" + cmcApiKey);
        //header
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-CMC_PRO_API_KEY", cmcApiKey);

        HttpEntity<String> publicEntity = new HttpEntity<>("parameters", headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(resourceUrl, HttpMethod.GET, publicEntity, String.class);
        return response;
    }


    /**
     * 코인원에서 Don 가격 USD로 가져오기. (USD는 별도 table로 환율관리)
     */
    @ResponseBody
    @GetMapping(value = "/restapi/getDonPrice")
    public String getDonPrice() {

        double donWonPrice = openApiService.getDonWonFromCoineone();
        double WonPerUsd = openApiService.getLateUsdExchangeRate();

        return String.valueOf(ComUtil.doubleDivide(donWonPrice, WonPerUsd));
    }


    //springboot 2.4.0 기능사용으로 항상 200 OK리턴.
    @ResponseBody
    @GetMapping(value = "/restapi/awsHealth")
    public ResponseEntity getHealth() {

//        if (isServerRunning) {
            return new ResponseEntity(HttpStatus.OK); //항상 200 OK return,
//        }
        //graceFulShutdownEventListener 시작되면 503리턴.
//        return new ResponseEntity(HttpStatus.NOT_ACCEPTABLE);
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



}
