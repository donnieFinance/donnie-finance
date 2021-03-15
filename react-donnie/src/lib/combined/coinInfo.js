import iostApi from "~/lib/iostApi";
import BigNumber from "bignumber.js";
import coinList from "~/coinList";
import priceApi from "~/lib/priceApi";
import properties from '~/properties'
import ComUtil from "~/util/ComUtil";

const contractList = properties.contractList

// Checking & Saving Coin rank list
const getCurrentCoinRankList = async () => {
    const list = []

    const promises = Object.values(contractList).map(async coin => {
        console.log({coin})
        const tokenName = coin.tokenName
        const pool = coin.pool


        if (pool) {
            const res = await getCoinInfo(tokenName, pool)

            list.push({
                tokenName: tokenName,
                img: coin.img,
                total: null,
                usd: 0,
                isOpen: true,   //컨트랙트가 열려 있는지 여부
                totalBalance: 0,
                // status: 0, //TODO 부모 글로벌에서 지정(라운드 진행상태)
                loading: false,
                decimals: 8,
                precision: 8,
                rate: 0,
                dony: 0,
                ...res
            })
        }


    })

    await Promise.all(promises)

    list.map((coin) => {
        if (typeof (coin.total) === 'number' && typeof (coin.usd) === 'number') {
            coin.totalBalance = new BigNumber(coin.total).times(coin.usd).toNumber();
        }
    })

    sortRanking(list)

    return list;


}

const getCoinInfo = async (tokenName, pool) => {
    const res = await Promise.all([
        getTotalSupply(pool),
        getCoinUsdPrice(tokenName),
        getDonUsdPrice(),
        iostApi.getPoolIsOpen(pool) //컨트랙트가 열려 있는지 여부
    ])

    const total = res[0]
    const usd = res[1]
    const dony = res[2]
    const isOpen = (res[3] === 'true')

    const rate = await getRewardRate({pool, total, usd, dony})

    let totalBalance;

    if (typeof (total) === 'number' && typeof (usd) === 'number') {
        totalBalance = new BigNumber(total).times(usd).toNumber();
    }

    return {
        total, usd, dony, isOpen, rate,totalBalance
    }
}

//get coin total
const getTotalSupply = async (pool) => {
    const total = await iostApi.getPoolTotalSupply(pool)
    return isNaN(total) ? 0 : parseFloat(total)
}

//get coin usd
const getCoinUsdPrice = async (tokenName) => {
    let coinUsdPrice = properties.USD_PRICE[tokenName]; //default value, in case of error.
    try {
        //let {data: res} = await priceApi.getCmcUsd(2405);
        let {data: coinUsdPrice} = await priceApi.getCoinUsdPrice(tokenName);
        if (coinUsdPrice && !isNaN(coinUsdPrice)) {
            coinUsdPrice = parseFloat(coinUsdPrice);
            return new BigNumber(coinUsdPrice).toNumber()
        }

    }catch (error) {
        console.log(error);
        return coinUsdPrice;
    }
    return coinUsdPrice
}


//get coin(DON) usd
const getDonUsdPrice = async () => {


    let donUsdPrice = 2.5; //2.5달러 기본값
    try {
        let {data:res} = await priceApi.getCoinUsdPrice('don');
        if (res) {
            let tempPrice = res; //data USD parsing
            if (tempPrice && !isNaN(tempPrice)) {
                donUsdPrice =  parseFloat(tempPrice);
            }
            return donUsdPrice;
        }
    } catch (error) {
        console.log(error);
        return donUsdPrice; //2.5달러 기본값
    }
    return donUsdPrice;
}

const getRewardRate = async ({pool, total, usd, dony}) => {
    try{
        const rewardRate = await iostApi.getPoolRewardRate(pool);
        if (rewardRate) {
            return ComUtil.calcAPR(rewardRate, total, dony, usd)
        }
    }
    catch (error) {
        console.log(error);
        return 0
    }

    return 0
}
//multi sort( totalBalance, name )
const sortRanking = (array) => {
    return array.sort(function (a, b) {
        let tb1 = a['totalBalance'];
        let tb2 = b['totalBalance'];
        let name1 = a['tokenName'];
        let name2 = b['tokenName'];

        if (tb1 > tb2) return -1
        if (tb1 < tb2) return 1
        if (name1 > name2) return 1
        if (name1 < name2) return -1

        // return ((tb1 > tb2) ? -1 : ((tb1 > tb2) ? 1 : 0));
    })
}

export default {
    getCurrentCoinRankList,
    getCoinInfo,
    getTotalSupply,
    getCoinUsdPrice,
    getRewardRate
}