package com.ezfarm.donnie.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.Random;

@Slf4j
@Component
public class ComUtil {


    /**
     * 랜던 String 생성 - image 이름으로 사용하기 위함.
     */
    private static final char[] ALPHA_NUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".toCharArray();
    private static final int RANDOM_LENGTH = 12;
    private static final Random random = new SecureRandom();

    public static String getRandomString() {
        char[] buf = new char[RANDOM_LENGTH];
        for (int idx = 0; idx < RANDOM_LENGTH; ++idx) {
            buf[idx] = ALPHA_NUMERIC[random.nextInt(ALPHA_NUMERIC.length)];
        }
        return new String(buf);
    }

    // hash된 String값 리턴, hash한후 ASCII로 바꿔서 리턴.
    public static byte[] getHash(String passwdStr) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            //messageDigest.update(passwdStr.getBytes(StandardCharsets.UTF_8)); //ERROR
            return digest.digest(passwdStr.getBytes(StandardCharsets.UTF_8));

        } catch (NoSuchAlgorithmException e) {
            log.error(e.toString());
        }
        return null;
    }

    /**
     * passPhrase를 Hash하는 용도
     */
    public static String getHashedString(String passwdStr) {

        byte[] hashedByte = getHash(passwdStr);
        return Base64.getEncoder().encodeToString(hashedByte);
    }

    /**
     * byte[] <-> String 출력해서 보는 용도.
     */
    //for log
    public static String byteArrayToHex(byte[] a) {
        StringBuilder sb = new StringBuilder(a.length * 2);
        for(byte b: a)
            sb.append(String.format("%02x", b));
        return sb.toString();
    }
    //온톨로지의 Helper.hexToBytes()를 쓰는게 안전.  (아래는 test용도)
    public static byte[] hexTobyteArray(String hex) {
        byte[] arr = new byte[hex.length()/2];

        //String 2개를 하나의 byte로 변환.
        for (int i = 0; i < hex.length()/2; i++) {

            String str2char = hex.substring(i*2, i*2 + 2);
            arr[i] = Byte.parseByte(str2char, 16); //16진수를 byte로 변환..
        }

        return arr;
    }



    private static SecretKeySpec setKey(String myKey) throws Exception{

        SecretKeySpec secretKey = null;
        byte[] key;

        MessageDigest sha = null;
        try {
            key = myKey.getBytes(StandardCharsets.UTF_8);
            sha = MessageDigest.getInstance("SHA-1");
            key = sha.digest(key);
            key = Arrays.copyOf(key, 16);
            secretKey = new SecretKeySpec(key, "AES");
        }
        catch (NoSuchAlgorithmException  e) {
            e.printStackTrace();
        }

        if (secretKey == null) throw new Exception("SecretKey is NULL");
        return secretKey;
    }

    /**
     * Ontology PrivateKey를 암호화 하는 용도.  passPhrase(Hash된 것)를 key로 사용해서 암호화 복호과
     */
    public static String encryptWithPassPhrase(byte[] rawOntPk, String passPhrase) {
        try
        {
            SecretKeySpec secretKey = ComUtil.setKey(passPhrase);

            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);

            //str Version: return Base64.getEncoder().encodeToString(cipher.doFinal(strToEncrypt.getBytes(StandardCharsets.UTF_8)));
            return Base64.getEncoder().encodeToString(cipher.doFinal(rawOntPk));
        }
        catch (Exception e)
        {
            log.error("Error while encrypting: " + e.toString());
        }
        return null;
    }

    public static byte[] decryptWithPassPhrase(String encryptedOntPk, String passPhrase) {
        try
        {
            SecretKeySpec secretKey = ComUtil.setKey(passPhrase);

            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            byte[] ontPk = cipher.doFinal(Base64.getDecoder().decode(encryptedOntPk));
            return ontPk;

            //return new String(ontPk);
        }
        catch (Exception e)
        {
            log.error("Error while decrypting: " + e.toString());
        }
        return null;

    }


    //BlyToBlct swap Account 용으로 추가......................
    public static String encryptPK(String pk) {
        byte[] byteKey = pk.getBytes(StandardCharsets.UTF_8);
        return encryptWithPassPhrase(byteKey, "myPassPhrase");
    }

    public static String decryptPK(String encryptedPk) {
        byte[] byteKey= decryptWithPassPhrase(encryptedPk, "myPassPhrase");
        return new String(byteKey, StandardCharsets.UTF_8);
    }

    /**
     * 버림 함수 (원화 혹은 소수점 몇자리에서 버림)
     */
//    public static double roundFloor(double value, int count) {
//        BigDecimal bigValue = new BigDecimal(value);
//        BigDecimal result = bigValue.setScale(count, BigDecimal.ROUND_FLOOR);  // ROUND_DOWN과 ROUND_FLOOR의 차이 (https://blog.leocat.kr/notes/2019/02/25/java-rounding)
//        return result.doubleValue();
//    }

    //소수점 2자리 반올림.
    //roundFloor(value,2)와 동일하나 좀 더 정확함: 예 100*0.0048 -> roundFlooer(,2)=0.47, roundDown2 = 0.48
    public static double roundDown2(double value) {
        BigDecimal bigValue = new BigDecimal(String.valueOf(value));
        BigDecimal result = bigValue.setScale(2, BigDecimal.ROUND_DOWN);  // ROUND_DOWN과 ROUND_FLOOR의 차이 (https://blog.leocat.kr/notes/2019/02/25/java-rounding)
        return result.doubleValue();
    }

    //20200724 소수점 2자리 유지하는 더블 연산 추가.. double연산시에는 항상 이걸 사용하면 소수점 2자리로 유지가 됨...///////////////////////////////////////////////////////////////////////////
    //주의 : 파라미터들도 모두 소수점 2자리여야 안전함.. multiply는 4자리도 됨.
    public static double doubleAdd(double a, double b) {
        BigDecimal bigA= new BigDecimal(String.valueOf(a));
        BigDecimal bigB= new BigDecimal(String.valueOf(b));

        BigDecimal ret = bigA.add(bigB);
        return ret.doubleValue();
    }

    //double 3개 더하기. 편의상 만듦. 꼭 써야하는건 아님..
    public static double doubleAdd3(double a, double b, double c) {
        BigDecimal bigA= new BigDecimal(String.valueOf(a));
        BigDecimal bigB= new BigDecimal(String.valueOf(b));
        BigDecimal bigC= new BigDecimal(String.valueOf(c));

        BigDecimal ret = bigA.add(bigB).add(bigC);
        return ret.doubleValue();
    }

    public static double doubleSubtract(double a, double b) {
        BigDecimal bigA= new BigDecimal(String.valueOf(a));
        BigDecimal bigB= new BigDecimal(String.valueOf(b));

        BigDecimal ret = bigA.subtract(bigB);
        return ret.doubleValue();
    }

    public static double doubleMultply(double a, double b) {
        BigDecimal bigA= new BigDecimal(String.valueOf(a));
        BigDecimal bigB= new BigDecimal(String.valueOf(b));

        BigDecimal ret = bigA.multiply(bigB);
        //return roundHalfUp(ret.doubleValue()/10000); //계산도중에는 반올림이 좋음.
        return roundDown2(ret.doubleValue()); //계산완료시에는 내림이 좋음
    }

    //BigDecimal 사용시..
//    public static double doubleLongMultply(double a, long b) {
//        String strA = String.valueOf(a);
//        BigDecimal bigA= new BigDecimal(strA); //wrong...
//        BigDecimal bigB= new BigDecimal(b);
//
//        BigDecimal ret = bigA.multiply(bigB);
//        //return roundHalfUp(ret.doubleValue()/10000); //계산도중에는 반올림이 좋음.
//        return roundDown2(ret.doubleValue()); //계산완료시에는 내림이 좋음
//    }

    //double 3개 곱하기. 편의상 만듦. 꼭 써야하는건 아님..
    public static double doubleMultply3(double a, double b, double c) {
        BigDecimal bigA= new BigDecimal(String.valueOf(a));
        BigDecimal bigB= new BigDecimal(String.valueOf(b));
        BigDecimal bigC= new BigDecimal(String.valueOf(c));

        BigDecimal ret = bigA.multiply(bigB).multiply(bigC);
        //return roundHalfUp(ret.doubleValue()/1000000); //계산도중에는 반올림이 좋음.
        return roundDown2(ret.doubleValue()); //계산완료시에는 내림이 좋음
    }

    public static double doubleDivide(double a, double b) {
        BigDecimal bigA= new BigDecimal(String.valueOf(a));
        BigDecimal bigB= new BigDecimal(String.valueOf(b));

        BigDecimal ret = bigA.divide(bigB, 2, BigDecimal.ROUND_HALF_UP); //소수점 2자리에서 반올림..

        return ret.doubleValue(); //소수점 2자리에서 짜름..
    }

    //계산도중에만 사용하는 내부함수..반올림. - 미사용
    private static double roundHalfUp(double value) {
        BigDecimal bigValue = new BigDecimal(String.valueOf(value));
        BigDecimal result = bigValue.setScale(2, BigDecimal.ROUND_HALF_UP);  //소수점 2자리에서 반올림..
        return result.doubleValue();
    }
}
