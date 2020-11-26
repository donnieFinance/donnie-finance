
import Server from '../property'
// import { Web3Provider } from '@ethersproject/providers'

export const testnetAddress = {
  token: 'dont', //old=donnie_test', //testnet tokenID

  iost: {
      pool: 'Contract4sZcpvFqjTFaDVTuy8PxeWdADgyjEXuWyibs1phu2dfB',  //pool-address
      tokenName: 'iost'
  },
  don: {
      pool: 'ContractHpKcw1tEm6RwRgvw882tdLg6NFhS4ieamJDYnHCQRv5N',
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

export const mainnetAddress = {
  token: 'don', //old='donnie_finance', //TODO mainet tokenID

  iost: {
      pool: '', //TODO
      tokenName: 'iost'
  },
  don: {
      pool: '', //TODO
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
export const address = (function() {
  if(Server.isTestnet()){
    return testnetAddress
  }else{
    return mainnetAddress
  }
})()

export const initContracts = () => {


    const iost = window.IWalletJS.newIOST(window.IOST);
    console.log('========== commons.js: initContracts iost=', iost);

    //Contract.setProvider(window.ethereum);
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
// 미사용.
// export const initContractsSend = () => {
//
//
//     // if(Server.isTestnet()) {
//     //     //Contract.setProvider(window.ethereum || 'wss://ropsten.infura.io/ws/v3/cce46a8caedd4ad29ea4556616730866')
//     //     Contract.setProvider(window.ethereum || 'wss://ropsten.eth.aragon.network')
//     // }else {
//     //     //Contract.setProvider(window.ethereum || 'wss://mainnet.infura.io/ws/v3/cce46a8caedd4ad29ea4556616730866')
//     //     Contract.setProvider(window.ethereum || 'wss://mainnet.eth.aragon.network')
//     // }
//     return {
//         address: address,
//         token: 'Contract5q2t7qB4d2bpheBFQkQZuzV6nznac3B8Y9mhW5vToxVs',
//         iost: {
//             pool: 'Contract8XrKdcuQs3KALMjwqfmFjTLAVRk6h46wS5wuKHmkXXBv',  //pool-address
//             erc20: 'iost' // contract-name
//         },
//         // bly: {
//         //     pool: new Contract(pool_abi.abi, address.bly.pool),
//         //     erc20: new Contract(erc_abi.abi, address.bly.erc20)
//         // },
//         // usdt: {
//         //     pool: new Contract(pool_abi.abi, address.usdt.pool),
//         //     erc20: new Contract(erc_abi.abi, address.usdt.erc20)
//         // },
//         // lend: {
//         //     pool: new Contract(pool_abi.abi, address.lend.pool),
//         //     erc20: new Contract(erc_abi.abi, address.lend.erc20)
//         // },
//     }
// }
