import React, {useEffect, useState} from 'react';
import properties from "~/properties";
import {Div, Flex, GridColumns, Button} from "~/styledComponents/shared";
import {useTranslation, withTranslation} from "react-i18next";
import PageHeading from "~/components/common/layouts/PageHeading";
import useSize from "~/hooks/useSize";
import loadable from "@loadable/component";
import {useRecoilState} from "recoil";
import {nowState, noticeModalState} from "~/hooks/atomState";
import useInterval from "~/hooks/useInterval";
import TotalHarvestedDon from "~/components/checking/TotalHarvestedDon";
import useUsdPrice from "~/hooks/useUsdPrice";
import {useHistory} from "react-router-dom";
import {BsArrowRight} from 'react-icons/bs'
import {IoIosLink} from 'react-icons/io'
const Item = loadable(() => import('./Item'))

const AttemptCard = () => {

    const {t} = useTranslation()
    const {sizeValue} = useSize()
    return(
        <Div lineHeight={sizeValue(25, null, 22)} bg={'white'} p={20} textAlign={'center'}>
            <Div fontSize={sizeValue(20, null,  18)} mb={10} fw={700}>{t('attemptTitle')}</Div>
            <Div>{t('attempt')}</Div>
            <a target={'_blank'} style={{wordBreak: 'break-word'}} href={'https://www.iostabc.com/contract/Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8'}>Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8</a>
        </Div>
    )
}


export default withTranslation()((props) => {

    const history = useHistory()
    const [, setNow] = useRecoilState(nowState)
    const [noticeOpen, setNoticeOpen] = useRecoilState(noticeModalState)
    const [lpTokens, setLpTokens] = useState([])
    const [tokenPools, setTokenPools] = useState([])

    //1분에 한번씩 코인별 usdPrice 갱신
    useUsdPrice()

    // const [status, startTime, endTime, duration] = useRunningStatus(
    //     {
    //         //EARN CARD 오픈 시간(최초 1회 오픈 전까지만 보이며 running 상태로 진입하면 화면에서 사라짐)
    //         forcedStartTime: properties.START_AT_FIRST,
    //         forcedEndTime: properties.START_AT_FIRST
    //     }
    // )

    // didMount 되었을 때 global 로 사용될 now 세팅
    useEffect(() => {


        let lpTokenList = []
        let tokenPoolList = []

        Object.keys(contractList).map( (key,i) => {
            const contract = contractList[key]
            if (contract.tokenType === 'lp') {
                lpTokenList.push(contract)
            }else{
                tokenPoolList.push(contract)
            }
        })

        // setIntervalStart(true)
        setNow(Date.parse(new Date))
        //공지사항을 읽지 않았을 경우만
        if (noticeOpen === null){
            // setNoticeOpen(true)
        }

        //캐시된 시간 저장
        setTimeout(() => localStorage.setItem('updateTime', new Date()), 500)




        //캐시된 시간 저장
        return(() => localStorage.setItem('updateTime', new Date()))

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

            {/*<Flex justifyContent={'center'} mb={40} mt={sizeValue(-40, null,  -26)}>*/}
            {/*    <AttemptCard />*/}
            {/*</Flex>*/}

            {/*{*/}
            {/*    [-1,0].includes(status) && (*/}
            {/*        <EarnCoinCard*/}
            {/*            onTokenScan={onTokenScan}*/}
            {/*            contractAddress={contractAddress}*/}
            {/*            status={status}*/}
            {/*            duration={ComUtil.leftTime(duration)}*/}
            {/*        />*/}
            {/*    )*/}
            {/*}*/}

            <Flex justifyContent={'center'} >
                <TotalHarvestedDon />
            </Flex>


            <Flex justifyContent={'center'}
                  flexDirection={'column'}
                  mt={sizeValue(50, 40, 50)}
                  pb={sizeValue(200, 90)}

            >

                <Flex mb={20} flexDirection={'column'}>
                    <Flex fg={'white'} fw={500} mb={5}>
                        <Div width={22} height={22} bc={'white'} rounded={'50%'} bg={'rgba(255,255,255,0.2)'}></Div>
                        <Div width={22} height={22} bc={'white'} rounded={'50%'} bg={'rgba(255,255,255,0.2)'} ml={-6} mr={8}></Div>
                        <Div fontSize={sizeValue(25, null, 20)} >
                            Liquidity Provider(LP) Token
                        </Div>
                    </Flex>
                    <Button bg={'white'} fg={'primary'} px={10} py={4} bold
                            onClick={() => {
                                history.push('/exchange/liquidity')
                                window.scrollTo({top:0, behavior:'smooth'})
                            }}>
                        <Flex>
                            <Div mr={5}>
                                Get LP Token
                            </Div>
                            <BsArrowRight />
                        </Flex>

                    </Button>
                </Flex>


                <GridColumns repeat={sizeValue(4, null, 1)}
                             rowGap={sizeValue(10, null,  40)}
                    // maxWidth={sizeValue(928,  null, '100%' )}
                             width={sizeValue('unset', null,'90%')}
                >
                    {

                        Object.keys(contractList).map( (key,i) => {
                            const contract = contractList[key]
                            if (contract.tokenType === 'lp') {
                                return (
                                    <Item
                                        key={`depositBigCard${i}`}
                                        contract={contract}
                                        uniqueKey={key}
                                        size={size === 'sm' ? 'small' : 'big'}
                                    />
                                )
                            }
                            return null
                        })
                    }
                </GridColumns>


                <Flex fg={'white'} fw={500} fontSize={25} mt={40} mb={20}>
                    <Div width={22} height={22} bc={'white'} rounded={'50%'} bg={'rgba(255,255,255,0.2)'} mr={8}></Div>
                    <Div fontSize={sizeValue(25, null, 20)} >
                        Token Pool
                    </Div>
                </Flex>
                <GridColumns repeat={sizeValue(4, null, 1)}
                             rowGap={sizeValue(10, null,  40)}
                    // maxWidth={sizeValue(928,  null, '100%' )}
                             width={sizeValue('unset', null,'90%')}
                >
                    {

                        Object.keys(contractList).map( (key,i) => {
                            const contract = contractList[key]
                            if (contract.tokenType !== 'lp') {
                                return (
                                    <Item
                                        key={`depositBigCard${i}`}
                                        contract={contract}
                                        uniqueKey={key}
                                        size={size === 'sm' ? 'small' : 'big'}
                                    />
                                )
                            }
                            return null
                        })
                    }
                </GridColumns>
            </Flex>

        </Div>
    );
});