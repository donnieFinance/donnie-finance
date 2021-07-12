import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import priceApi from "~/lib/priceApi";
import BigNumber from "bignumber.js";

import properties from "~/properties";
import {Div, Flex, Img, Right} from "~/styledComponents/shared";
import { List, Card } from 'antd';
import ComUtil from "~/util/ComUtil";
import useCoinInfo from "~/hooks/useCoinInfo";
import useInterval from "~/hooks/useInterval";
import {Space} from "antd";
import useUsdPrice from "~/hooks/useUsdPrice";

const DonImage = properties.tokenImages.don

const Home = (props) => {

    //useUsdPrice() 와 useCoinInfo 는 같이 사용 해야함
    //useCoinInfo 내부에서 전역 변수인 useUsdPrice 값이 세팅 되면 coinInfo 정보를 가져오기 시작함
    useUsdPrice()
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
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 4,
                        lg: 4,
                        xl: 6,
                        xxl: 3,
                    }}
                    dataSource={coins}
                    renderItem={(coin, index) => (
                        <List.Item>
                            <Card title={coin.uniqueKey}>
                                <Div fontSize={18} lighter>
                                    {
                                        `${ComUtil.addCommas(coin.total)}`
                                    }
                                </Div>
                                <Div fontSize={20} lighter>
                                    {
                                        `$${ComUtil.addCommas(coin.usd.toFixed(2))}`
                                    }
                                </Div>
                            </Card>
                        </List.Item>
                    )}
                />
            </Div>
        </Div>
    );
};

export default Home;
