package com.ezfarm.donnie.dataclass;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//https://www.kamis.or.kr/customer/reference/openapi_list.do?action=detail&boardno=6 참조
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsdExchangeRawData {

    int result;
    String cur_unit;
    String ttb;

    String tts;
    String deal_bas_r;   //float 매매기준율
    String bkpr;         //int 장부가격

    String yy_efee_r;
    String ten_dd_efee_r;
    String kftc_bkpr;

    String kftc_deal_bas_r;
    String cur_nm;

}
