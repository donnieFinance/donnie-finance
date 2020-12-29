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

    static getCheckingAndSavingCoinInfo (coin, t) {

        const coinInfo = {
            status: '',
            name: '',
            img: '',
            explain: '',
            mining: '',
            total: '',
            usd: '',
            rate: '',
            // loading: coin.loading
        }

        coinInfo.status = coin.status
        coinInfo.name = coin.name.toUpperCase()
        coinInfo.img = coin.img

        // Deposit to mine
        if([0].indexOf(coin.status) > -1) {
            coinInfo.explain = t('Provide',{x: coin.name.toUpperCase()})
            coinInfo.buttonText = `${t('Deposit')}`
        }else if ([1,2].indexOf(coin.status) > -1 ) {

            coinInfo.mining = t('Mining')
            coinInfo.buttonText = `${t('Deposit')}`

            if (coin.total !== '...') {

                coinInfo.total = coin.total.toFixed(2)
                // console.log('==coinInfo.total:::'+coinInfo.total)
            }

            if (coin.usd) {
                coinInfo.usd = `≈${coin.totalBalance.toFixed(2)} USD`
            }

            if (coin.rate) {
                coinInfo.rate = `${t('annualization')} : ${coin.rate.toFixed(2)} %`

            }
        }else if ([3].indexOf(coin.status) > -1) {
            coinInfo.explain = `${t('closePool')}`
            coinInfo.buttonText = `${t('HarvestWithdraw')}`
        }

        //console.log({coin})
        return coinInfo
    }

}