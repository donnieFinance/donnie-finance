import React, {useEffect, useState} from 'react';
import properties from "~/properties";
import {Div, Flex, GridColumns, XCenter} from "~/styledComponents/shared";
import {withTranslation} from "react-i18next";
import PageHeading from "~/components/common/layouts/PageHeading";
import useSize from "~/hooks/useSize";
import loadable from "@loadable/component";
import EarnCoinCard from "~/components/common/layouts/EarnCoinCard";
import useRunningStatus from "~/hooks/useRunningStatus";
import ComUtil from "~/util/ComUtil";
import {useRecoilState} from "recoil";
import {nowState} from "~/hooks/atomState";
import useInterval from "~/hooks/useInterval";
import TotalHarvestedDon from "~/components/checking/TotalHarvestedDon";
const Item = loadable(() => import('./Item'))
export default withTranslation()((props) => {

    const [, setNow] = useRecoilState(nowState)

    const [status, startTime, endTime, duration] = useRunningStatus(
        {
            //EARN CARD 오픈 시간(최초 1회 오픈 전까지만 보이며 running 상태로 진입하면 화면에서 사라짐)
            forcedStartTime: properties.START_AT_FIRST,
            forcedEndTime: properties.START_AT_FIRST
        }
    )

    // didMount 되었을 때 global 로 사용될 now 세팅
    useEffect(() => {
        // setIntervalStart(true)
        setNow(Date.parse(new Date))
    }, [])

    // 1초에 한번씩 global 로 사용될 now 갱신
    useInterval(() => {
        setNow(Date.parse(new Date))
    }, 1000)


    //!!주의!! 모두 Object 형식임 (Array 아님!)
    const {contractList, coinList, oldAddress} = properties

    const {t} = props;
    const {checking} = t('menu', {returnObjects: true})

    const contractAddress = properties.address.token;
    const {size, sizeValue} = useSize()

    const onTokenScan = () => {
        window.open("https://www.iostabc.com/token/" + contractAddress)
    }

    return (
        <Div>
            <PageHeading
                title={checking.name}
                description={checking.desc}
            />
            {
                [-1,0].includes(status) && (
                    <EarnCoinCard
                        onTokenScan={onTokenScan}
                        contractAddress={contractAddress}
                        status={status}
                        duration={ComUtil.leftTime(duration)}
                    />
                )
            }

            <Flex justifyContent={'center'} >
                <TotalHarvestedDon />
            </Flex>


            <Flex justifyContent={'center'}
                  mt={sizeValue(50, 40, 50)}
                  pb={sizeValue(200, 90)}

            >
                <GridColumns repeat={sizeValue(4, null, 1)}
                             rowGap={sizeValue(10, null,  40)}
                    // maxWidth={sizeValue(928,  null, '100%' )}
                             width={sizeValue('unset', null,'90%')}
                >
                    {

                        Object.keys(contractList).map( (key,i) => {
                            const contract = contractList[key]
                            return (
                                <Item
                                    key={`depositBigCard${i}`}
                                    contract={contract}
                                    uniqueKey={key}
                                    size={size === 'sm' ? 'small' : 'big'}
                                />
                            )
                        })
                    }
                </GridColumns>
            </Flex>

        </Div>
    );
});