package com.ezfarm.donnie.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Slf4j
@Component
public class DateUtil {

    //향후 Date관련된 함수들 다 모으기 위해서 작성.
    //DB 필드는 Date도 괜찮으나, 변환이나 비교등에서는 LocalDateTime 사용하기를 권장 //////////////////


    /**
     *  Date 타입을 사용하기 좋은 LocalDateTime으로 변경.
     */
    public static LocalDateTime date2LocalDateTime(Date date){
        return new java.sql.Timestamp(
                date.getTime()).toLocalDateTime();
    }

    public static LocalDate date2LocalDate(Date date){
        return new java.sql.Timestamp(
                date.getTime()).toLocalDateTime().toLocalDate();
    }

    public static String date2Yyyymmdd(Date date){
        SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd");
        String str_OrderDate = dateFormatter.format(date);

        return str_OrderDate;
    }

    /**
     *  LocalDateTime을 Date로 변경.
     */
    public static Date localDateTime2Date(LocalDateTime localDate){
        return java.sql.Timestamp.valueOf(localDate);
    }


    /**
     * yyyymmdd -> LocalDateTime으로 변경.
     */

    public static LocalDateTime yyyymmdd2LocalDateTime(String yyyymmdd){

        int year = Integer.valueOf(yyyymmdd.substring(0,4));
        int month = Integer.valueOf(yyyymmdd.substring(4,6));
        int day = Integer.valueOf(yyyymmdd.substring(6,8));

        LocalDate date = LocalDate.of(year,month,day);


        return date.atTime(0,0); //yyyy-mm-dd 00:00:00
    }

    /**
     * yyyymmdd -> LocalDate으로 변경.
     */

    public static LocalDate yyyymmdd2LocalDate(String yyyymmdd){

        int year = Integer.valueOf(yyyymmdd.substring(0,4));
        int month = Integer.valueOf(yyyymmdd.substring(4,6));
        int day = Integer.valueOf(yyyymmdd.substring(6,8));

        LocalDate date = LocalDate.of(year,month,day);
        return date;
    }

    /**
     * LocalDate -> yyyymmdd(int)으로 변경.
     */
    public static int localDate2YyyymmddInt(LocalDate localDate) {
        return Integer.parseInt(localDate2Yyyymmdd(localDate));
    }


    public static int localDate2YyyymmInt(LocalDate localDate) {

        return Integer.valueOf(localDate.format(DateTimeFormatter.ofPattern("yyyyMM")));
    }
    public static int localDate2YyyyInt(LocalDate localDate) {
        return localDate.getYear();
    }
    /**
     * LocalDateTime -> yyyymmdd(String)으로 변경.
     */
    public static String localDateTime2Yyyymmdd(LocalDateTime localDateTime) {
        return localDateTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    /**
     * LocalDateTime -> yyyymmdd(int)으로 변경.
     */
    public static int localDateTime2YyyymmddInt(LocalDateTime localDateTime) {
        return Integer.parseInt(localDateTime.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
    }

    public static long localDateTime2YyyymmddhhmmssLong(LocalDateTime localDateTime) {
        return Long.parseLong(localDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
    }

    /**
     * return  yyyymmdd
     */
    public static String localDate2Yyyymmdd(LocalDate localDate) {

//        return localDate.getYear()
//                + String.format("%02d", localDate.getMonthValue())
//                + String.format("%02d", localDate.getDayOfMonth());
        return localDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    public static String localDate2Yyyymm(LocalDate localDate) {

//        return localDate.getYear()
//                + String.format("%02d", localDate.getMonthValue());
        return localDate.format(DateTimeFormatter.ofPattern("yyyyMM"));
    }

    /**
     * yyyymmdd -> 03/01(월) 형태로 변환
     */
    public static String yyyymmdd2DisplayYoil(String yyyymmdd){

        int year = Integer.valueOf(yyyymmdd.substring(0,4));
        int month = Integer.valueOf(yyyymmdd.substring(4,6));
        int day = Integer.valueOf(yyyymmdd.substring(6,8));

        LocalDate date = LocalDate.of(year,month,day);

        return String.format("%02d", month) + "/" +  String.format("%02d", day) + "("  +  int2Yoil(date.getDayOfWeek().getValue())   + ")" ;
    }
    /**
     * yyyymmdd -> yyyy/mm/dd형태로 변환
     */
    public static String yyyymmdd2Display(String yyyymmdd){
        int year = Integer.valueOf(yyyymmdd.substring(0,4));
        int month = Integer.valueOf(yyyymmdd.substring(4,6));
        int day = Integer.valueOf(yyyymmdd.substring(6,8));
        return year + "/" +  month + "/"  +  day ;
    }

    /**
     * yyyymm -> 2020년03월 형태로 변환
     */
    public static String yyyymm2Display(String yyyymm){
        int year = Integer.valueOf(yyyymm.substring(0,4));
        int month = Integer.valueOf(yyyymm.substring(4,6));

        return year + "년" +  month + "월";
    }

    //1-> 월, 5-> 금
    private static String int2Yoil(int dayOfWeek) {
        switch (dayOfWeek) {
            case 1: return "월";
            case 2: return "화";
            case 3: return "수";
            case 4: return "목";
            case 5: return "금";
            case 6: return "토";
            case 7: return "일";
        }
        return " ";
    }



}
