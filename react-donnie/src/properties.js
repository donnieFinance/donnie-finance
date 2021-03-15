import ImgIost from "~/assets/coin_iost.png";
import ImgDon from "~/assets/coin_don.png";
import ImgHusd from "~/assets/coin_husd.png";
import ImgPumpkin from "~/assets/coin_pumpkin.png";
// import ImgIwbtc from "~/assets/coin_wbtc.png";
// import ImgIwbly from "~/assets/coin_bly.png";
// import ImgIweth from "~/assets/coin_weth.png";

import ImgBtc from "~/assets/coin_bitcoin.svg";
import ImgEth from "~/assets/coin_ethereum.svg";
import ImgBly from "~/assets/coin_bly.png";

const config = {
  mode: process.env.NODE_ENV,
  appMode: process.env.REACT_APP_ENV
}

const _serverMode = (function() {
  if(config.mode==="production"){
    if(config.appMode === "staging"){
      return 'stage'; // 개발 모드
    }
    return 'production'; // 운영 모드
  } else {

    return 'stage'; // 개발 모드 빌드
    // return 'production'; // 상용모드 빌드 (npmBuild가 자동으로 안되서, blocery처럼 여기 풀어서 사용.)
  }
})();

const getRestAPIHost = (function (){
  const protocol = window.location.protocol; // => http:,https:
  if(window.location.hostname === 'localhost'){
    return protocol+'//localhost/restapi';
  }else {
    if (_serverMode === 'stage') {
      return protocol+"//210.92.91.206/restapi";
    } else {
      return protocol + '//donnie.finance/restapi';//AWS 서버 IP = http://13.209.43.206
    }
  }
})();

const token = {
  name:"DON"
}

const DON_FEE = 5;
const BLY_FEE = 100;

//[주의!] 꼭 milliseconds 로 입력 해야함!
const START_AT_FIRST = 1615248000000 //start time [메인 최상단용 카드] //0309 09(seoul)
const HOUR20 = 72000000;
const ONE_WEEK = 604800000;
const DAYS60 = 5184000000;
const DAYS30 = 2592000000;

//const UNTIL = ONE_WEEK;
const UNTIL = HOUR20;

const isTestMode = _serverMode === 'stage' ? true:false;

const address = (function() {
  if (isTestMode) {
    return {
      token: 'dontest', //old=donnie_test', //testnet tokenID
      tokenAddress: 'Contract5NzBFVFrAY8gBZKHDb8BCpQEgwqBnbg88e5FSPuX99ho',
    }
  }else{
    return {
      token: 'don', //old='donnie_finance', //TODO mainet tokenID
      tokenAddress: 'Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8',
    }
  }
})();

const getContractList = () => {
  try{
    // Testnet
    if (isTestMode) {
      return {
        //
        // iost02: {
        //   pool: 'Contract4fkS2BqoAod6aMJRLVVwgt5ieLapRkmfZ3MuYsXbgKSP',  // 20210224:15:20 시작 pool
        //   tokenName: 'iost',
        //   img: ImgIost,
        //   totalDon: 192345, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
        //   //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
        //   forcedStartTime: '',
        //   forcedEndTime: '',
        // },
        // don02: {
        //   pool: 'ContractFoucXbZ2ErZ1XYdvHGDRu2VSb9obyaegwb6sfzB69ACs',  // 20210224:15:10 시작 pool
        //   tokenName: 'dontest', //old='donnie_test'  //testMode (mainnet)
        //   img: ImgDon,
        //   totalDon: 192345, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
        //   //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
        //   forcedStartTime: '',
        //   forcedEndTime: '',
        // },


        iost02: {
          pool: '', //TODO 2021년 3월 16일 9시 시작 pool
          tokenName: 'iost',
          img: ImgIost,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO
          forcedStartTime: 1615852800000, //2021.03.16
          forcedEndTime: 1618272000000, //2021.04.13 4주.
        },
        iwbly: {
          pool: 'ContractBqyyq8ozA7f4414jqC82J6zGfwsd6zx7MJhMTFncfbyj',
          tokenName: 'iwbly_t5',
          tokenAddress:'ContractFMXwdKuN8MspWtXG8jWt4uEZRMjt2jmzp36yFSHwDqg7',  //TODO iw토큰들은 iw토큰address,flag,ercName 필수. 3가지.
          isIwFlag: true,  //iw swap 여부
          ircTokenName:'iwBLY',
          ercTokenName: 'BLY',
          img: ImgBly,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '',
          forcedEndTime: '',
          enableSwap: true
        },
        iost01: {
          pool: 'ContractHHaN2P6Bf9XgovMoyps1ik8qTxdzRoBVpxvUJFnoG3tx',  // 20210223:15:30 시작 pool
          tokenName: 'iost',
          img: ImgIost,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '',
          forcedEndTime: '',
        },
        don01: {
          pool: 'Contract6SwQwSFVu2LY3bCmJ7ESEms2EPAHejgotUHGxzxC44Eh',  // 20210308:15:30 시작 pool
          // pool: 'ContractBJEmtj67XPxuHaSqsBnDp3o1Dw5avLQdAmWwH2htVe6c',  // 20210223:15:00 시작 pool
          tokenName: 'dontest', //old='donnie_test'  //testMode (mainnet)
          img: ImgDon,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '',
          forcedEndTime: '',
        },
        husd01: {
          pool: 'Contracthx9t72EH6txBijTP6xcEFBGjtnV1yvMGSJB5v7ksywF',  // 20210308:14:00 시작 pool
          // pool: 'Contract6Y5u9ePvNdqKHhbfBhYXvLJ5SMmnfS982Jeo9eNDTC7M',  // 20210223:14:00 시작 pool
          tokenName: 'husd',
          img: ImgHusd,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '',
          forcedEndTime: '',
        },
        ppt01: {
          pool: 'ContractEnB4wLxfJbcanJHp8sgSnVmKvAubcPy7Roxz8TGBcXWQ',  // 20210223:14:30 시작 pool
          tokenName: 'ppt',
          img: ImgPumpkin,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '',
          forcedEndTime: '',
        },

        iwbtc: {
          pool: 'Contract6xfKRr754g1CzDAEit7714zHoYTNhaesRC1xaeanJGjn', // 20210315:10:10 시작 pool
          tokenName: 'iwbtc_t1',
          tokenAddress:'ContractqRRbyweDWRyaX1NjaJKAobeXqPxhdcTXbHdK6CYV54B',  //TODO iw토큰들은 iw토큰address,flag,ercName 필수. 3가지.
          isIwFlag: true,  //iw swap 여부
          ircTokenName:'iwBTC',
          ercTokenName: 'wBTC',
          img: ImgBtc,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '', //2021.03.23
          forcedEndTime: '', //2021.04.20 4주.
          enableSwap: true
        },
        iweth: {
          pool: 'Contract8QukbEN9j2szcamBtZWpkSPsD2aahLvVUZwcuHyXu3YS', // 20210315:10:10 시작 pool
          tokenName: 'iweth_t1',
          tokenAddress:'Contract2U2bb28GCcTWCqKS1ZH3hfvcFw18DYEzbJuvFJRydd89',  //TODO iw토큰들은 iw토큰address,flag,ercName 필수. 3가지.
          isIwFlag: true,  //iw swap 여부
          ircTokenName:'iwETH',
          ercTokenName: 'wETH',
          img: ImgEth,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '', //2021.03.30
          forcedEndTime: '', //2021.04.07
          enableSwap: true
        }
      }
    }
    // Mainnet
    else {
      return {
        iost01: {
          pool: 'Contract8JxGDc8B8Xa94uKv12bgSMkvShPjCPRLTNDMZYMbghGi', //TODO 2021년 3월 16일 9시 시작 pool
          tokenName: 'iost',
          img: ImgIost,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          forcedStartTime: '', //2021.03.16
          forcedEndTime: '', //2021.04.13 4주.
        },
        iwbly: {
          pool: 'ContractJKKceEZpZxNa6iF5MFDxqkcnwjgfBe7XBD1hHLXuYr5',
          tokenName: 'iwbly',
          tokenAddress:'ContractA41qesco7HC9scMs7cbD58H8ekBPSfXaWJiEwa3VFedR',  //TODO iw토큰들은 iw토큰address,flag,ercName 필수. 3가지.
          isIwFlag: true,  //iw swap 여부
          ircTokenName:'iwBLY',
          ercTokenName: 'BLY',
          img: ImgBly,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: '', //2021.03.17
          forcedEndTime: '',
          enableSwap: true
        },
        iost: {
          pool: 'ContractABsvBxZRs2ebP2EfUseykskMqsp7eAgnfALZTQKK7zrN', // 2021년 3월 9일 9시 시작 pool
          tokenName: 'iost',
          img: ImgIost,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
        },
        don: {
          pool: 'ContractEVccWL1ryjYhdStdiB6zL3qjQrfeU4o5cKbdzEheTp9W', // 2021년 3월 9일 9시 시작 pool
          tokenName: 'don', //old='donnie_finance'  //mainnet
          img: ImgDon,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
        },
        husd: {
          pool: 'ContractDPZmnXKC7GpPnnnn6Xzt353mwSn9caFas14p4af5dYy7',  // 2021년 3월 9일 9시 시작 pool
          tokenName: 'husd',
          img: ImgHusd,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
        },
        ppt: {
          pool: 'Contract7BArV1B3DUHjCoB8BDLqtJb21rmrsJM8oAwuPTojT5hB',  // 2021년 3월 9일 9시 시작 pool
          tokenName: 'ppt',
          img: ImgPumpkin,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
        },


        iwbtc: {
          pool: '',
          tokenName: 'iwbtc',
          tokenAddress:'ContractBWgi917ZzJM8fR4pHtcAS7gdy9uRRcGmajWLyEYh9NUR',  //TODO iw토큰들은 iw토큰address,flag,ercName 필수. 3가지.
          isIwFlag: true,  //iw swap 여부
          ircTokenName:'iwBTC',
          ercTokenName: 'wBTC',
          img: ImgBtc,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: 1616457600000, //2021.03.23
          forcedEndTime: 1618876800000, //2021.04.20 4주.
          enableSwap: false
        },
        iweth: {
          pool: '',
          tokenName: 'iweth',
          tokenAddress:'Contract3TpRLcZNyntHYMv9xuGzedveWhViRVSMGBXRxFBcMQ2R',  //TODO iw토큰들은 iw토큰address,flag,ercName 필수. 3가지.
          isIwFlag: true,  //iw swap 여부
          ircTokenName:'iwETH',
          ercTokenName: 'wETH',
          img: ImgEth,
          totalDon: 50000, //전체 don 수량 (카드의 detail 클릭시 확인 가능)
          //TODO 테스트 용도 값입니다. 테스트 서버 배포전 값 삭제 필수
          forcedStartTime: 1616457600000, //2021.03.23
          forcedEndTime: 1618876800000, //2021.04.20 4주.
          enableSwap: false
        }


      }
    }
  }
  catch (err){
    console.error(err.message)
    return null
  }
}

const properties = {
  serverMode: _serverMode,
  DonDistributionFileLink: 'https://docs.google.com/spreadsheets/d/1CaKr87rrqtqDlz3Ks3PGH-ZuIAbosekU/edit#gid=63756537',
  whitePaperFileLink: 'https://drive.google.com/file/d/1Wgu773VlOyiAcpD1X8m6YYdQIu4y13PE/view?usp=sharing',
  restAPIHost: getRestAPIHost,
  isTestMode: isTestMode,
  token: token,
  START_AT_FIRST: START_AT_FIRST, //첫 오픈시간 (메인 카드용)
  DON_FEE: DON_FEE,
  BLY_FEE: BLY_FEE,
  ONE_WEEK: ONE_WEEK,
  DAYS60: DAYS60,
  DAYS30: DAYS30,
  UNTIL: UNTIL,
  IOST_ADDR: 'https://api.iost.io', //testMode도 동일. (Properties.isTestmode())?'http://13.52.105.102:30001':'https://api.iost.io';
  address: address,
  contractList: getContractList(),
  tokenImages: {
    iost: ImgIost,
    don: ImgDon,
    husd: ImgHusd,
    ppt: ImgPumpkin,
  },
  USD_PRICE: {
    don: 2.5,
    iost: 0.04,
    husd: 1.0,
    ppt: 0.04 * 5.2  //20210223, CommonController의 /restapi/getCoinUsdPrice참고
  },

};

export default properties;
