package com.ezfarm.donnie.dbdata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

//https://www.kamis.or.kr/customer/reference/openapi_list.do?action=detail&boardno=6 참조
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsdExchangeRate {

    @Id
    int day;          //yyyymmdd

    double baseRate;   //float 매매기준율
    int baseIntRate;  //int 장부가격

}
