import moment from 'moment-timezone'
import {isMobileOnly} from "react-device-detect";
import properties from "~/properties";

import iconLpDonHusd from '~/assets/icon_lp_don_husd.png'
import iconLpDonIost from '~/assets/icon_lp_don_iost.png'
import iconLpIostHusd from '~/assets/icon_lp_iost_husd.png'

export default class ComUtil {
    static delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }

    // 밀리세컨드 -> 일 시 분 초 계산
    static leftTime(e) {
        let Time = {
            day: '00',
            hour: '00',
            minutes: '00',
            seconds: '00'
        };
        let Distance = e;

        if (Distance > 0) {
            // 86400000 = 1일, 3600000 = 1시간, 60000 = 1분, 1000 = 1초
            Time.day = Math.floor(Distance / 86400000);
            Distance -= Time.day * 86400000;
            Time.hour = Math.floor(Distance / 3600000);
            Distance -= Time.hour * 3600000;
            Time.minutes = Math.floor(Distance / 60000);
            Distance -= Time.minutes * 60000;
            Time.seconds = Math.floor(Distance / 1000).toFixed(0);
            Distance -= Time.seconds * 1000;
            if (Time.day < 10) {
                Time.day = '0' + Time.day;
            }
            if (Time.hour < 10) {
                Time.hour = '0' + Time.hour;
            }
            if (Time.minutes < 10) {
                Time.minutes = '0' + Time.minutes;
            }
            if (Time.seconds < 10) {
                Time.seconds = '0' + Time.seconds;
            }
            return Time;
        } else {
            return Time;
        }
    }
    static getWindowSize (width) {
        if (width <= 640){
            return 'sm'
        }else if (width > 640 && width < 1130) {
            return 'md'
        }else {
            return 'lg'
        }
    }

    static numToString = (num) => {
        let m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    }

    // 모바일 Devices 여부
    static isMobileDevices = () => {
        if (isMobileOnly) {
            return true;
        }else{
            return false;
        }
    }

    // 모바일 여부
    static isMobile = () => {
        let sUserAgent = navigator.userAgent.toLowerCase();
        let bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        let bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        let bIsMidp = sUserAgent.match(/midp/i) === "midp";
        let bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        let bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        let bIsUcBrowser = sUserAgent.match(/ucbrowser/i) == "ucbrowser";
        let bIsAndroid = sUserAgent.match(/android/i) == "android";
        let bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        let bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";

        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM || bIsUcBrowser) {
            return true;
        } else {
            return false;
        }
    }

    static getCheckingAndSavingCoinInfo (coin, tokenName, status, t) {

        // console.log({ComUtilCoin: coin, status})

        const coinInfo = {...coin}
        coinInfo.status = status
        coinInfo.name = tokenName.toUpperCase()
        coinInfo.img = coin.img

        // Preparing
        if ([-1].includes(status)) {
            coinInfo.explain = t('Provide',{x: ComUtil.coinName(coinInfo.name)})
            coinInfo.buttonText = `${t('depositToMine')}`
        }
        // Coming soon
        else if([0].indexOf(status) > -1) {
            coinInfo.explain = t('Provide',{x: ComUtil.coinName(coinInfo.name)})
            coinInfo.buttonText = `${t('depositToMine')}`
        }
        // Running, Ended
        else if ([1,2].indexOf(status) > -1 ) {

            coinInfo.mining = t('Mining')
            coinInfo.buttonText = `${t('depositToMine')}`

            if (status === 2 ) {
                coinInfo.buttonText = `${t('HarvestWithdraw')}` //20200107 종료시 text만 수정.
            }

            if (coin.total !== null) {
                coinInfo.total = coin.total.toFixed(2)
                // console.log('==coinInfo.total:::'+coinInfo.total)
            }

            //USD
            if (coin.usd) {
                coinInfo.usd = `≈${this.addCommas(coin.totalBalance.toFixed(2))} USD`
            }

            //APR
            if (coin.rate) {
                // console.log({rate: coin.rate})
                coinInfo.rate = `${t('annualization')} : ${coin.rate.toFixed(2)} %`

            }
        }
        // Pool ended
        else if ([3].indexOf(status) > -1) {
            coinInfo.explain = `${t('closePool')}`
            coinInfo.buttonText = `${t('HarvestWithdraw')}`
        }

        //console.log({coin})
        return coinInfo
    }

    static utcToString(utcTime, formatter) {
        try{

            if (!utcTime)
                return null

            const format = formatter ? formatter : "YYYY.MM.DD"

            const utcDate = moment(utcTime);
            return utcDate.tz(moment.tz.guess()).format(format)
        }catch (err){
            return null
        }
    }

    static utcUnixToString(utcTime, formatter) {
        try{

            if (!utcTime)
                return null

            const format = formatter ? formatter : "YYYY.MM.DD"

            const utcDate = moment(utcTime*1000)
            return utcDate.tz(moment.tz.guess()).format(format)
        }catch (err){
            return null
        }
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    static getCellStyle = ({cellAlign,color,textDecoration,whiteSpace}) => {
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
    }
    static execCopy(text, successMsg, failedMsg) {
        return new Promise((resolve) => {

            const fallbackCopyTextToClipboard = (text) => {
                let textArea = document.createElement("textarea");
                textArea.value = text;

                // document.body.appendChild(textArea);
                document.body.prepend(textArea);

                textArea.readOnly = true;
                textArea.focus();
                textArea.select();

                try{

                    let successful = document.execCommand('copy');

                    document.body.removeChild(textArea);

                    return successful

                }catch (err) {
                    return false
                }
            }

            if (!navigator.clipboard) {
                resolve(fallbackCopyTextToClipboard(text));
            }

            navigator.clipboard.writeText(text)
                .then(() => {
                    // alert("코드가 복사되었습니다");
                    resolve(true)
                })
                .catch(err => {
                    // This can happen if the user denies clipboard permissions:
                    resolve(fallbackCopyTextToClipboard(text));
                });
        })
    }

    static async copyTextToClipboard(text, successMsg, failedMsg) {
        const isCopied = await ComUtil.execCopy(text)
        if (isCopied && successMsg) {
            alert(successMsg)
        }else{
            if (failedMsg)
                alert(failedMsg)
        }

        return isCopied
    }

    //HTTPS 에서 정상 동작합니다
    static async pasteClipboardText() {
        return await navigator.clipboard.readText();
    }

    static replaceDecimalNumber(amount, limitLength) {
        const sp = amount.toString().split('.');
        let lNum = parseFloat(sp[0]) || 0
        let rNum = sp.length >= 2 ? sp[1] : '';

        if(rNum.length > limitLength) {
            rNum = rNum.substring(0, limitLength)
            console.log({
                amount,
                lNum:lNum,
                rNum,
                result: lNum + '.' + rNum
            })

            return parseFloat(lNum + '.' + rNum)
        }

        return amount
    }

    static minusFee(amount, fee) {
        const sp = amount.toString().split('.');

        let lNum = parseFloat(sp[0]) || 0
        let rNum = sp.length >= 2 ? sp[1] : '';

        if(rNum.length > 8) {
            rNum = rNum.substring(0, 8)
        }

        let remainedAmount = lNum - fee;

        let returnValue;

        if(rNum.length === 0) {
            returnValue = lNum - fee
        }else {
            returnValue = parseFloat(remainedAmount + '.' + rNum)
        }


        // console.log(`${amount} - ${fee} = ${returnValue}`)
        return returnValue;
    }

    /*******************************************************
     소수점 자리수 버림
     @Param : number, midPointRoundingNumber(소수점 자릿수)
     @Return : number
     *******************************************************/
    static roundDown(number, midPointRoundingNumber){
        return this.decimalAdjust('floor', number, midPointRoundingNumber * (-1));
    }

    static decimalAdjust(type, value, exp){
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    /*******************************************************
     금액 형식으로 리턴
     [값이 0 보다 작으면 '' 반환]
     @Param : 304100
     @Return :304,100
     *******************************************************/
    static toCurrency(value) {
        const number = ComUtil.toNum(value)
        if(number >= 0)
            return ComUtil.addCommas(number)
        else {
            return ''
        }
    }

    /*******************************************************
     숫자 및 문자(숫자)에 comma 추가
     [잘못된 값 이외엔 항상 0 이상을 반환 하는 함수]
     @Param : 1234567
     @Return : 1,234,567
     *******************************************************/
    static addCommas(value) {
        //숫자로 변환 불가능한 잘못된 값일 경우 null로 리턴 하도록 함
        if((typeof value !== 'number' && !value) || isNaN(value)){
            return null;
        }
        return ComUtil.toNum(value).toLocaleString(undefined, {maximumFractionDigits : 20})
    }
    /*******************************************************
     string, number 판별 후 숫자가 아닌 잘못 된 값이면 0, 올바른 값이면 숫자변환
     [계산시 에러가 나지 않도록 항상 숫자로만 리턴하는 함수]
     @ex :
     가나abc304100마바사 => 304100
     '6,700' => 6700
     undefined => 0
     'undefined' => 0
     null => 0
     @Param : number or string(숫자)
     @Return : number
     *******************************************************/
    static toNum(value, isParsingNumber = true) {
        try{
            let removedValue = value.toString().replace(/\,/g,'')     //콤마제거
            removedValue = removedValue.replace(/\s/gi, '');			//공백제거
            //계산 가능한 숫자인지 판별
            if(isNaN(removedValue) || removedValue === '')
                return 0
            else {
                if (isParsingNumber)
                    return parseFloat(removedValue)
                else
                    return removedValue
            }
        }catch(e){
            return 0
        }
    }

    static sortByKey (array, key) {
        return array.sort(function (a, b) {
            let x = a[key];
            let y = b[key];
            return ((x > y) ? -1 : ((x > y) ? 1 : 0));
        })
    }

    static calcAPR = (symbol, total, dony, usd) => {
        return (((symbol / (total < 1 ? 1 : total) * dony) * 360 * 24 * 60 * 60) / usd) * 100;
    }

    static countdown (time) {
        return `${time.day} : ${time.hour} : ${time.minutes} : ${time.seconds}`
    }

    static coinName (coinNm) {
        if(coinNm){

            if (coinNm.length >= 8) {
                return ComUtil.getDPLpTokenName(coinNm.toLowerCase())
            }

            if(coinNm.toUpperCase().includes('IW')){
                const rCoinNm = coinNm.toUpperCase();
                return rCoinNm.toString().replace(/IW/g,'iw')     //replace all
                // return rCoinNm.replaceAll('IW','iw');
            }
            return coinNm;
        }
    }

    static ethGbNm (tokenNm) {
        if(tokenNm){
            if(tokenNm.toUpperCase() === 'BNB'){
                return 'BEP20-BSC';
            }
            return 'ERC';
        }
    }

    static getDestroyBlyAmount = (destroyAddress) => {
        if (properties.destroyBlyAmount[destroyAddress]) {
            return properties.destroyBlyAmount[destroyAddress]
        }
        return 0
    }



    static getDestroyBtcAmount = (destroyAddress) => {
        if (properties.destroyBtcAmount[destroyAddress]) {
            return properties.destroyBtcAmount[destroyAddress]
        }
        return 0
    }

    //SwapPair 명칭 리턴 ex) don_husd
    static findSwapPair = (swapPairs, symbol1, symbol2) => {
        try{
            return swapPairs.find(item => item.pairKey === `${symbol1}_${symbol2}` || item.pairKey === `${symbol2}_${symbol1}`)
        }catch (err) {
            return null
        }
    }

    static getLpTokenIcon = (symbol1,symbol2) => {
        if(symbol1 === 'don' && symbol2==='husd'){
            return iconLpDonHusd
        } else if (symbol1 === 'iost' && symbol2==='husd'){
            return iconLpIostHusd
        } else if (symbol1 === 'don' && symbol2==='iost'){
            return iconLpDonIost
        }
        return null;
    }

    //for exchange : iwbnb => iwBNB
    static getDisplayTokenName = (tokenName) => {
        return tokenName.toUpperCase().replace(/^IW/, 'iw');
    }

    static getDPLpTokenName = (lpTokenName) => {
        const dpLpTokenName = lpTokenName.toString()
            .replace(/don/g,'Don').replace(/husd/g,'Husd').replace(/iost/g,'Iost').replace(/bnb/g,'Bnb')
            .replace(/lp$/g,'LP')  //production
            .replace(/tt$/g,'TT'); //stage
        return dpLpTokenName;
    }

    //exchange image 세팅용도
    static getLpTokenNames = (lpTokenName) => {
        const dpLpTokenName = lpTokenName.toString();
        if(dpLpTokenName.includes('donhusd')){
            return ['don','husd']
        }
        if(dpLpTokenName.includes('doniost')){
            return ['don','iost']
        }
        if(dpLpTokenName.includes('iosthusd')){
            return ['iost','husd']
        }
        if(dpLpTokenName.includes('bnbhusd')){
            return ['bnb','husd']
        }
        return null;
    }

    //[Checking & Saving 페이지 캐시된 날짜체크(60분 이내 재접속인지)
    static isCached = (minutes = 60) => {
        try{

            const updateTime = localStorage.getItem('updateTime')
            console.log({updateTime})
            if (!updateTime
                // || updateTime !== "" || updateTime === null || updateTime === undefined
            )
                return false

            const t1 = moment(updateTime)

            // const t1 = moment('2021-04-01 00:00:00')
            const t2 = moment()

            //최종 업데이트 된(checking 페이지 접속한) 시간차(분)
            const diffMinutes = moment.duration(t2.diff(t1)).asMinutes()

            if (diffMinutes <= minutes) {
                return true
            }
        }catch (err){
            return false
        }
        return false
    }
}