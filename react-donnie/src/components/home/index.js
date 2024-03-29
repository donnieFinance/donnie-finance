import React, {useEffect} from 'react'
import {Div} from '~/styledComponents/shared'
import loadable from '@loadable/component'
import imgSaving from '~/assets/savings.svg'
import imgSavingWhite from '~/assets/savings_w.svg'

import imgLoan from '~/assets/loan.svg'
import imgLoanWhite from '~/assets/loan_w.svg'

import imgIdo from '~/assets/ido.svg'
import imgIdoWhite from '~/assets/ido_w.svg'

import imgExchange from '~/assets/exchange.svg'
import imgExchangeWhite from '~/assets/exchange_w.svg'

import imgCredit from '~/assets/credit_score.svg'
import imgCreditWhite from '~/assets/credit_score_w.svg'


import imgPayment from '~/assets/card.svg'
import imgPaymentWhite from '~/assets/card_w.svg'

import imgPortfolio from '~/assets/fund_management.svg'
import imgPortfolioWhite from '~/assets/fund_management_w.svg'
import useSize from "~/hooks/useSize";
import ComUtil from "~/util/ComUtil";
import properties from "~/properties";

const Web = loadable(() => import('./Web'))
const Mobile = loadable(() => import('./Mobile'))

const store = [
    {
        pathname: '/checking',
        img: imgSaving,
        hoverImg: imgSavingWhite,
        alt: 'Saving',
        title: 'Checking and Saving',
        desc: 'Deposit and Withdraw cryptocurrency anytime, anywhere with no fee.',
        fg: '#33658A'
    },
    {
        pathname: '/exchange',
        img: imgExchange,
        hoverImg: imgExchangeWhite,
        alt: 'Exchange',
        title: 'Exchange',
        desc: 'Trade Cryptocurrency-to-Cryptocurrency with Automated Liquidity Provision.',
        fg: '#758E4F'
    },
    {
        pathname: '/iostarter',
        img: imgIdo,
        hoverImg: imgIdoWhite,
        alt: 'IOSTarter',
        title: 'IOSTarter',
        desc: 'Join a IOSTarter,  built for cross-chain token offerings, which enables new projects to raise liquidity in a decentralized fair protocol.',
        fg: '#86BBD8',
        isNew: (properties.isNewIdoExist)? true:false
    },
    {
        pathname: '/credit',
        img: imgCredit,
        hoverImg: imgCreditWhite,
        alt: 'Credit Analysis',
        title: 'Credit Analysis',
        desc: 'Create a secure credit analytics system to be used within the decentralized financial ecosystem.',
        fg: '#F6AE2D',
        isNew:false
    },
    {
        pathname: '/payment',
        img: imgPayment,
        hoverImg: imgPaymentWhite,
        alt: 'Payment',
        title: 'Payment',
        desc: 'Support direct transaction between users through the network.',
        fg: '#584D3D'
    },
    {
        pathname: '/portfolio',
        img: imgPortfolio,
        hoverImg: imgPortfolioWhite,
        alt: 'Portfolio Mgmt.',
        title: 'Portfolio Mgmt.',
        desc: 'Aggregator service gives advice on users\' cryptocurrency investments and automatically balances users\' digital assets.',
        fg: '#F26419'
    }
]

export default () => {

    const {size} = useSize()

    useEffect(() => {
        //TODO : 초반 10분 이상 지났을때는 쿠키 클리어, 나중에는 60분 으로 (체킹페이지) 같이 맞춰주면 될듯 함
        if(!ComUtil.isCached(10)) {
            localStorage.removeItem("coinStatus")
            localStorage.removeItem("coinInfo")
            localStorage.removeItem("coin")
            localStorage.removeItem("updateTime")
        }
    }, [])

    return(
        <Div bg={'background'} style={{height: '100%'}} >
            {
                size === 'lg' ? <Web store={store} /> : <Mobile store={store} />
            }
        </Div>
    )

}
