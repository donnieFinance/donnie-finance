const config = {
  //not working - mode:process.env.NODE_ENV
  mode:process.env.REACT_APP_ENV
}



const _serverMode = (function() {
  if(config.mode==="production"){
    if(config.appMode === "staging"){
      return 'stage'; // 개발 모드
    }
    return 'production'; // 운영 모드
  } else {
    return 'stage'; // 개발 모드
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

const ONE_WEEK = 604800000;
const DAYS60 = 5184000000;
const DAYS30 = 2592000000;

const UNTIL = DAYS30;

const isTestMode = _serverMode === 'stage' ? true:false;
//const isTestMode = false;

const testmodeAddress = {
  token: 'dont', //old=donnie_test', //testnet tokenID

  iost: {
    pool: 'Contract91rNUfUBnFGDdAAgaoUu2U5Dneo1ZYwnqiZxGrWXCWpf',  //pool-address
    tokenName: 'iost'
  },
  don: {
    pool: 'Contract3xaZgaSBL3isxqv3RUyL8SdnQ2TQCmjmCiGpgtrT4yH5',
    tokenName: 'dont', //old='donnie_test'  //testMode (mainnet)
  },
  // usdt: {
  //     pool: '0x207768FaA2Fa7D4705246Fb7338F9e986120da0e',
  //     erc20: '0xe4b343a05371d36f1d556c9cc841d0fb8654e9f7' //ropsten-usdt
  // },
  // lend: {
  //     pool: '0x6744fcB2264E1AB898efD12bb40895866Ae770e3',
  //     erc20: '0xe2a519e8B8EaDa81681C729D0E76b45f2F23B22f'  //ropsten-lend
  // },

  //추가시마다 아래 3군데 같이 추가.
}

const mainnetAddress = {
  token: 'don', //old='donnie_finance', //TODO mainet tokenID

  iost: {
    pool: 'ContractABsvBxZRs2ebP2EfUseykskMqsp7eAgnfALZTQKK7zrN', //TODO
    tokenName: 'iost'
  },
  don: {
    pool: 'ContractEVccWL1ryjYhdStdiB6zL3qjQrfeU4o5cKbdzEheTp9W', //TODO
    tokenName: 'don', //old='donnie_finance'  //mainnet
  },
  // usdt: {
  //     pool: '', //TODO
  //     erc20: '0xdAC17F958D2ee523a2206206994597C13D831ec7' //mainnet-usdt
  // },
  // lend: {
  //     pool: '', //TODO
  //     erc20: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03'  //mainnet-lend
  // },
}

//for testMode
const address = (function() {
  if (isTestMode) {
    return testmodeAddress
  }else{
    return mainnetAddress
  }
})();

const getContractList = () => {
  try{
    return {
      address: address,
      token: address.token, //'donnie_test' or 'donnie_finance,
      iost: address.iost,
      don: address.don, //TODO TOKEN_ADD6
      //{
      //     pool: 'Contract8XrKdcuQs3KALMjwqfmFjTLAVRk6h46wS5wuKHmkXXBv',  //pool-address
      //     erc20: 'iost' // contract-name
      // },
      // bly: {
      //     pool: new Contract(pool_abi.abi, address.bly.pool),
      //     erc20: new Contract(erc_abi.abi, address.bly.erc20)
      // },
      // usdt: {
      //     pool: new Contract(pool_abi.abi, address.usdt.pool),
      //     erc20: new Contract(erc_abi.abi, address.usdt.erc20)
      // },
      // lend: {
      //     pool: new Contract(pool_abi.abi, address.lend.pool),
      //     erc20: new Contract(erc_abi.abi, address.lend.erc20)
      // },
    }
  }
  catch (err){
    console.error(err.message)
    return null
  }
}

const properties = {};
properties.restAPIHost = getRestAPIHost;
properties.isTestMode = isTestMode;
properties.token = token;
properties.ONE_WEEK = ONE_WEEK;
properties.DAYS60 = DAYS60;
properties.DAYS30 = DAYS30;
properties.UNTIL = UNTIL;
properties.IOST_ADDR = 'https://api.iost.io'; //testMode도 동일. (Properties.isTestmode())?'http://13.52.105.102:30001':'https://api.iost.io';
properties.address = address;
// properties.testmodeAddress = testmodeAddress;
// properties.mainnetAddress = mainnetAddress;
properties.contractList = getContractList();

export default properties;
