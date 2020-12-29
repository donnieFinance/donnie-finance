import React, {useEffect} from 'react';
import {Flex, Div, Right, Button, Img, A} from "~/styledComponents/shared";

import icon_telegram from '~/assets/icon_telegram.png'
import icon_twitter from '~/assets/icon_twitter.png'
// import icon_discord from '~/assets/icon_discord.png'
import icon_medium from '~/assets/icon_medium.png'
// import icon_reddit from '~/assets/icon_reddit.png'
import icon_github from '~/assets/icon_github.png'
import useSize from "~/hooks/useSize";
import properties from '~/properties'

import loadable from "@loadable/component";

const MobileFooter = loadable(() => import('./MobileFooter'))
const WebFooter = loadable(() => import('./WebFooter'))

const iconList = [
    {
        img: icon_telegram,
        link: 'https://t.me/donniefinance'
    },
    {
        img: icon_twitter,
        link: 'https://twitter.com/DonnieFinance'
    },
    // {
    //   img: icon_discord.png',
    //   link: ''
    // },
    {
        img: icon_medium,
        link: 'https://donnie-finance.medium.com/'
    },
    // {
    //   img: icon_reddit,
    //   link: ''
    // },
    {
        img: icon_github,
        link: 'https://github.com/donnieFinance/donnie-finance'
    }
]

const Footer = (props) => {

    const {size} = useSize()

    useEffect(() => {
        console.log({properties})
    }, [])

    return (
        <>
            {
                ['sm'].indexOf(size) > -1 ? (
                    <MobileFooter iconList={iconList}/>
                ) : (
                    <WebFooter iconList={iconList}/>
                )
            }




        </>
    )
}
export default Footer;
