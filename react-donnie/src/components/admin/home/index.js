import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import priceApi from "~/lib/priceApi";
import BigNumber from "bignumber.js";

import coinInfo from "~/lib/combined/coinInfo";
import properties from "~/properties";
import {Div, Flex, Img, Right} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import useCoinInfo from "~/hooks/useCoinInfo";
import useInterval from "~/hooks/useInterval";
import {Space} from "antd";

const DonImage = properties.tokenImages.don

const Home = (props) => {

    const {coinInfo, refresh, loading} = useCoinInfo({delay:5000})

    const {totalUsd, totalHarvestedDonBalance, list: coins} = coinInfo

    return (
        <Div>
            <Div fontSize={18} mb={10}>
                예치 현황
            </Div>
            <Div>
                <Flex mb={10}>
                    <Flex bc={'secondary'} rounded={5} p={10}>
                        <Div fontSize={18} mr={10}>USD</Div>
                        <Div fontSize={30} bold>
                            {
                                `$${ComUtil.addCommas(totalUsd)}`
                            }
                        </Div>
                    </Flex>
                    <Flex bc={'secondary'} rounded={5} p={10} ml={20}>
                        <Flex fontSize={18} mr={10}><Img width={20} src={DonImage} mr={5} />수확량</Flex>
                        <Flex fontSize={30} bold>
                            {
                                `${ComUtil.addCommas(totalHarvestedDonBalance)} DON`
                            }
                        </Flex>
                    </Flex>
                </Flex>


                <Flex>
                    {
                        coins.map((coin, index) =>
                            <Flex key={`coin${index}`} justifyContent={'center'} minWidth={120} minHeight={120} flexDirection={'column'} bg={'primary'} fg={'white'} rounded={4} mr={10} px={5}>
                                <Div fontSize={12}>{coin.uniqueKey}</Div>
                                <Div fontSize={18} lighter>
                                    {
                                        `${ComUtil.addCommas(coin.total)}`
                                    }
                                </Div>
                                <Div fontSize={25} lighter>
                                    {
                                        `$${ComUtil.addCommas(coin.usd.toFixed(2))}`
                                    }
                                </Div>
                            </Flex>

                        )
                    }
                </Flex>
            </Div>
        </Div>
    );
};

export default Home;
