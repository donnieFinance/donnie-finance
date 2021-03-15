import ImgIost from '~/assets/coin_iost.png'
import ImgDon from '~/assets/coin_don.png'
import ImgHusd from '~/assets/coin_husd.png'
import ImgPumpkin from '~/assets/coin_pumpkin.png'

export const checking = [
    {
        name: 'iost',
        img: ImgIost,
        total: null,
        usd: 0,
        totalBalance: 0,
        status: 0,
        isOpen: true,
        decimals: 8,
        precision: 8,
        rate: 0,
        dony: 0,
        loading: true,
    },
    {
        name: 'don',
        img: ImgDon,
        total: null,
        usd: 0,
        totalBalance: 0,
        status: 0,
        isOpen: true,
        decimals: 8,
        precision: 8,
        rate: 0,
        dony: 0,
        loading: true,
    },
    {
        name: 'husd',
        img: ImgHusd,
        total: null,
        usd: 0,
        totalBalance: 0,
        status: 0,
        isOpen: true,
        decimals: 8,
        precision: 8,
        rate: 0,
        dony: 0,
        loading: true,
    },
    {
        name: 'ppt',
        img: ImgPumpkin,
        total: null,
        usd: 0,
        totalBalance: 0,
        status: 0,
        isOpen: true,
        decimals: 8,
        precision: 8,
        rate: 0,
        dony: 0,
        loading: true,
    },
]

export default {
    checking,
}
