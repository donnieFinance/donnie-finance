import ImgIost from '~/assets/coin_iost.png'
import ImgDon from '~/assets/coin_don.png'

export const checking = [
    {
        name: 'iost',
        img: ImgIost,
        total: '...',
        usd: 0,
        totalBalance: 0,
        status: 0,
        isOpen: true,
        decimals: 8,
        precision: 8,
        rate: 0,
        dony: 0
    },
    {
        name: 'don',
        img: ImgDon,
        total: '...',
        usd: 0,
        totalBalance: 0,
        status: 0,
        isOpen: true,
        decimals: 8,
        precision: 8,
        rate: 0,
        dony: 0
    },
]

export default {
    checking,
}
