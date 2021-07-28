import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Hr, Link, Span, SymbolIcon} from "~/styledComponents/shared";
import useSize from "~/hooks/useSize";
import {useTranslation} from "react-i18next";
import {Heading, SymbolGroup} from "~/components/exchange/Components";
import {Modal, Skeleton, Tooltip, Space} from "antd";
import {useRecoilState} from "recoil";
import {connectWalletModalState, liquidityInfo, nowState, swapPairsState, usdPriceState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";
import {useHistory} from "react-router-dom";
import useWallet from "~/hooks/useWallet";
import iostApi from "~/lib/iostApi";
import loadable from "@loadable/component";
import useInterval from "~/hooks/useInterval";
import BigNumber from "bignumber.js";
import properties from "~/properties";
import {BsQuestionCircle} from "react-icons/bs";
import {AiOutlinePlus} from "react-icons/ai";
import {FaChevronDown, FaChevronUp} from 'react-icons/fa'
import {BsChevronDown} from 'react-icons/bs'
import {BiChevronDown, BiChevronUp} from 'react-icons/bi'
import useModal from "~/hooks/useModal";
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";

const Item = loadable( () => import("~/components/checking/Item"));
const LiquidityWithdraw = loadable( () => import("~/components/common/contents/LiquidityWithdraw"));

const LiquidityItem = ({dataIdx, data, isDeposit, onLinkClick, onDepositLpTokenClick, onRemoveLiquidityClick, onClose, t, tExchange}) => {

    const {sizeValue} = useSize()


    const history = useHistory()
    const [isOpen, setOpen, selected, setSelected, setOpenState, toggle] = useModal();

    //1분마다 갱신되는 usdPrice
    const [usdPrice] = useRecoilState(usdPriceState)

    //symbol1 밸런스
    const symbol1Liquidity = new BigNumber(data.symbol1Total)
    //symbol2 밸런스
    const symbol2Liquidity = new BigNumber(data.symbol2Total)

    //symbol1 달러
    const symbol1LiquidityUsd = symbol1Liquidity.multipliedBy(usdPrice[data.symbol1] || properties.USD_PRICE[data.symbol1])
    //symbol2 달러
    const symbol2LiquidityUsd = symbol2Liquidity.multipliedBy(usdPrice[data.symbol2] || properties.USD_PRICE[data.symbol2])

    //평가 가치 (Estimated value)
    const totalLiquidity = symbol1LiquidityUsd.plus(symbol2LiquidityUsd)


    return(
        <Div>
            <Div
                bg={'white'}
                py={17}
                px={sizeValue(26, null, 15)}
                shadow={'lg'}
                bc={'light'}
                rounded={20}
                relative
            >

                <Div>

                    <Flex justifyContent={'space-between'}>
                        <Flex>
                            <SymbolGroup
                                symbol1={data.symbol1}
                                symbol2={data.symbol2}
                                size={30}
                            />
                            <Div mx={8} mt={3} fontSize={18} cursor>
                                <Link to={`/exchange/liquidity/add/${data.symbol1}/${data.symbol2}`}>
                                    <u>{data.dpLpTokenName}</u>
                                </Link>
                            </Div>
                            <Div fg={'blue'} mt={6}>
                                <Tooltip title={t('lpTokenDesc')} placement="top">
                                    <BsQuestionCircle />
                                </Tooltip>
                            </Div>
                        </Flex>
                        <Flex onClick={toggle} cursor={1}>
                            <Div mr={2} fw={600}>
                                more
                            </Div>
                            {
                                isOpen ? <BiChevronUp /> : <BiChevronDown />
                            }
                        </Flex>
                    </Flex>

                    <Div my={10}>
                        <Flex justifyContent={'space-between'} alignItems={'flex-start'}>
                            <Flex flexWrap={'wrap'}>
                                <Div>
                                    {t('myLpToken')+' / ' + t('Depositing')}
                                </Div>
                                <Flex mt={-2} fg={'blue'} ml={5}>
                                    <Tooltip title={t('myShareDesc')} placement="top">
                                        <BsQuestionCircle />
                                    </Tooltip>
                                </Flex>
                            </Flex>
                            <Div fg={'info'} flexShrink={0}>
                                {
                                    `${data.lpTokenBalance} / ${data.myStakedBalance}`
                                }
                            </Div>
                        </Flex>
                        <Flex justifyContent={'space-between'}>
                            <Div>
                                {ComUtil.getDisplayTokenName(data.symbol1)}
                            </Div>
                            <Div>
                                { (data.symbol1Balance && data.symbol1Balance > 0) ? new BigNumber(data.symbol1Balance).toFixed(4):0}
                            </Div>
                        </Flex>
                        <Flex justifyContent={'space-between'}>
                            <Div>
                                {ComUtil.getDisplayTokenName(data.symbol2)}
                            </Div>
                            <Div>
                                { (data.symbol2Balance && data.symbol2Balance > 0) ? new BigNumber(data.symbol2Balance).toFixed(4):0}
                            </Div>
                        </Flex>
                        <Flex justifyContent={'space-between'} >
                            <Div>{t('poolShare')}</Div>
                            <Div>
                                {data.lpTokenBalanceRate.toFixed(2)}%
                            </Div>
                        </Flex>


                        {
                            isOpen && (

                                <Div>
                                    <Hr my={10}></Hr>
                                    <Div>
                                        <Div mb={10} bold>Total Liquidity</Div>
                                        <Div lineHeight={24}>
                                            <Div>
                                                <Flex justifyContent={'space-between'}>

                                                    <Space>
                                                        <SymbolIcon src={properties.tokenImages[data.symbol1]} alt={data.symbol1} width={20} zIndex={1} p={1}/>
                                                        <Div>{data.symbol1.toUpperCase()}</Div>
                                                    </Space>

                                                    <Div>
                                                        {`${ComUtil.addCommas(symbol1Liquidity.decimalPlaces(0, 1))}`}

                                                        {/*{new BigNumber(usdPrice[data.lpTokenName]).multipliedBy(data.lpTokenBalance).toNumber().toFixed(2)} USD*/}
                                                    </Div>
                                                </Flex>
                                            </Div>
                                            <Div>
                                                <Flex justifyContent={'space-between'}>
                                                    <Space>
                                                        <SymbolIcon src={properties.tokenImages[data.symbol2]} alt={data.symbol2} width={20} zIndex={1} p={1}/>
                                                        <Div>{data.symbol2.toUpperCase()}</Div>
                                                    </Space>

                                                    <Div>
                                                        {`${ComUtil.addCommas(symbol2Liquidity.decimalPlaces(0, 1))}`}

                                                        {/*{new BigNumber(usdPrice[data.lpTokenName]).multipliedBy(data.lpTokenBalance).toNumber().toFixed(2)} USD*/}
                                                    </Div>
                                                </Flex>
                                            </Div>
                                            <Div>
                                                <Flex justifyContent={'space-between'}>
                                                    <Div>
                                                        {t('estimatedValue')}
                                                    </Div>
                                                    <Div>
                                                        {`$${ComUtil.addCommas(totalLiquidity.decimalPlaces(0, 1))}`}
                                                        {/*{new BigNumber(usdPrice[data.lpTokenName]).multipliedBy(data.lpTokenBalance).toNumber().toFixed(2)} USD*/}
                                                    </Div>
                                                </Flex>
                                            </Div>
                                        </Div>
                                    </Div>





                                    {/*<Div>*/}
                                    {/*    {t('totalPool')}*/}
                                    {/*    <Flex justifyContent={'space-between'}>*/}
                                    {/*        <Div>*/}
                                    {/*            {ComUtil.getDisplayTokenName(data.symbol1)}*/}
                                    {/*        </Div>*/}
                                    {/*        <Div>*/}
                                    {/*            { (data.symbol1Total && data.symbol1Total > 0) ? new BigNumber(data.symbol1Total).toFixed(4):0}*/}
                                    {/*        </Div>*/}
                                    {/*    </Flex>*/}
                                    {/*    <Flex justifyContent={'space-between'}>*/}
                                    {/*        <Div>*/}
                                    {/*            {ComUtil.getDisplayTokenName(data.symbol2)}*/}
                                    {/*        </Div>*/}
                                    {/*        <Div>*/}
                                    {/*            { (data.symbol2Total && data.symbol2Total > 0) ? new BigNumber(data.symbol2Total).toFixed(4):0}*/}
                                    {/*        </Div>*/}
                                    {/*    </Flex>*/}
                                    {/*</Div>*/}
                                </Div>
                            )
                        }

                    </Div>


                    <Flex justifyContent={'center'}>

                        {
                            isDeposit &&
                                <Button
                                    // bc={'info'}
                                    px={10}
                                    bg={'donnie'}
                                    fg={'white'}
                                    rounded={5}
                                    onClick={onDepositLpTokenClick}
                                    //항상 [Lp Token 에치] 버튼이 보이도록 주석 처리함
                                    // disabled={data.lpTokenBalance > 0 ? false:true}
                                    mr={10}
                                >
                                    {t('depositLpToken')}
                                </Button>
                        }

                        <Button
                            // bc={'info'}
                            px={10}
                            bg={'primary'}
                            fg={'white'}
                            rounded={5}
                            onClick={onRemoveLiquidityClick}
                            disabled={data.lpTokenBalance > 0 ? false:true}>{tExchange.removeLiquidity}
                        </Button>
                    </Flex>

                </Div>
            </Div>
        </Div>


    )
}

const DepositModalContent = ({tokenName, dpTokenName, lpTokenBalance}) => {
    const {t} = useTranslation()
    const [, setNow] = useRecoilState(nowState)

    // 1초에 한번씩 global 로 사용될 now 갱신
    useInterval(() => {
        setNow(Date.parse(new Date))
    }, 1000)

    return (
        <Div bg={'secondary'} p={16}>
            <Div fontSize={20} bold fg={'white'}>{`${t('myLpToken')} ${lpTokenBalance}`}</Div>
            <Div fg={'white'} lighter mb={16}>
                {t('Provide', {x: `LP Token (${tokenName}) `})}
            </Div>
            <GridColumns repeat={1} rowGap={20}>
            {
                Object.keys(properties.contractList).map(key => {
                    const contract = properties.contractList[key]
                    if (contract.tokenName === tokenName) {
                        return <Item
                            uniqueKey={key}
                            contract={contract}
                            size={'small'}
                        />
                    }else{
                        return null
                    }
                })
            }
            </GridColumns>
        </Div>
    )
}


const Liquidity = (props) => {

    const {sizeValue} = useSize()
    const {t} = useTranslation()

    // lang (en or ko)
    const tMessage = t('message', {returnObjects: true})
    const tExchange = t('exchange', {returnObjects: true})

    const history = useHistory()
    const [, setConnectWalletModalOpen] = useRecoilState(connectWalletModalState)
    const {address} = useWallet()

    // const [swapPairs] = useRecoilState(swapPairsState)

    const [myLpTokenList, setMyLpTokenList] = useState()
    const [isMyLpTokenListLoading, setIsMyLpTokenListLoading] = useState(true)

    const [withDrawModal,setWithDrawModal] = useState(false);
    const [withDrawInfo,setWithDrawInfo] = useState(null);
    const [swapPairKey,setSwapPairKey] = useState(null);

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();


    useEffect( () => {
        getMyLpTokenList()
    }, [address])

    //LP Token click
    const onDepositLpTokenClick = (tokenName, dpTokenName, lpTokenBalance) => {
        setSelected({tokenName, dpTokenName, lpTokenBalance})
        setModalState(true)
    }

    const onAddLiquidityClick = () => {
        if (!address) {
            setConnectWalletModalOpen(true)
            return
        }

        history.push(`/exchange/liquidity/add`)
    }

    const getMyLpTokenList = async () => {
        const data = await iostApi.getMyLpTokenList(address);
        setMyLpTokenList(data);
        console.log({data})
        setIsMyLpTokenListLoading(false);
    }

    const onWithDraw = async (item) => {
        //console.log("onWithDraw=====",item)
        setSwapPairKey(item.swapPairKey);
        setWithDrawInfo(item)
        setWithDrawModal(true);
        getMyLpTokenList();
    }
    const onWithDrawClose = async () => {
        setSwapPairKey(null);
        setWithDrawInfo(null)
        setWithDrawModal(false);
        getMyLpTokenList();
    }

    const onLinkClick = (symbol1, symbol2) => {
        history.push(`/exchange/liquidity/add/${symbol1}/${symbol2}`)
    }

    //코인별 전체 밸런스 업데이트(5초마다 체크)
    useInterval(() => {
        if(address) {
            getMyLpTokenList();
        }
    }, [5000])

    const ModalHeader = () => {
        if (!withDrawInfo) return null
        return(
            <Flex>
                {/*<SymbolIcon src={properties.tokenImages[withDrawInfo.symbol1]} alt="" width={30} zIndex={1}/>*/}
                {/*<SymbolIcon src={properties.tokenImages[withDrawInfo.symbol2]} alt="" width={30} ml={-7}/>*/}
                <SymbolGroup
                    symbol1={withDrawInfo.symbol1}
                    symbol2={withDrawInfo.symbol2}
                    size={25}
                />
                <Span ml={7} mt={4}>{withDrawInfo.dpLpTokenName}</Span>
            </Flex>
        )
    }

    return (
        <Div width={sizeValue(436, null, '95%')} minHeight={721}>
            <Div bg={'white'} minHeight={400} rounded={10} shadow={'lg'}>

                {/* Card */}
                <Div>

                    {/* Title */}
                    <Heading
                        title={'Liquidity'}
                        desc={t('addLiquidityDesc')}
                    />
                    <Div mx={24} mb={20}>
                        <Button bc={'info'} bg={'white'} fg={'info'} px={15} rounded={5} bold fontSize={15} height={48} onClick={onAddLiquidityClick}>
                            {
                                !address ? t('connectWallet'): <Flex><AiOutlinePlus /><Span ml={10} mt={5} lineHeight={17}>{tExchange.addLiquidity}</Span></Flex>
                            }
                        </Button>
                    </Div>

                    <Hr/>

                    {/* Content */}
                    <Div p={sizeValue(24, null, 15)}>
                        <Div mb={10}>
                            <Flex justifyContent={'space-between'}>
                                <Div bold>{t('myLiquidity')}</Div>
                                <Flex>
                                    <Div></Div>
                                </Flex>
                            </Flex>
                        </Div>
                        {
                            isMyLpTokenListLoading ? <Skeleton active/> :
                                <GridColumns
                                    repeat={1}
                                    rowGap={20}
                                    // pt={24} textAlign={'center'}
                                >
                                    {
                                        myLpTokenList ?
                                            myLpTokenList && myLpTokenList.map((myLpTokenItem, index) =>
                                                <LiquidityItem key={'myLpTokenItem_'+index}
                                                               dataIdx={index}
                                                               data={myLpTokenItem}
                                                    // onLinkClick={onLinkClick.bind(this, myLpTokenItem.symbol1, myLpTokenItem.symbol2)}
                                                               onDepositLpTokenClick={onDepositLpTokenClick.bind(this, myLpTokenItem.lpTokenName, myLpTokenItem.dpLpTokenName, myLpTokenItem.lpTokenBalance)}
                                                               onRemoveLiquidityClick={onWithDraw.bind(this,myLpTokenItem)}
                                                               onClose={onWithDrawClose}
                                                               t={t}
                                                               tExchange={tExchange}
                                                               isDeposit={myLpTokenItem.isDeposit}
                                                />
                                            )
                                            :
                                            <Div textAlign={'center'}>{t('PleaseConnect')}</Div>
                                    }
                                </GridColumns>
                        }
                    </Div>

                </Div>

            </Div>

            {/* 디파짓 */}
            <Modal
                title={t('depositLpToken')}
                visible={modalOpen}
                onCancel={() => setModalState(false)}
                bodyStyle={{padding: 0}}
                footer={null}
                width={'auto'}
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}

            >
                <DepositModalContent
                    tokenName={selected && selected.tokenName}
                    dpTokenName={selected && selected.dpTokenName}
                    lpTokenBalance={selected && selected.lpTokenBalance} />
            </Modal>

            {/* 인출 withdraw */}
            <Modal
                title={<ModalHeader/>}
                visible={withDrawModal}
                onCancel={onWithDrawClose}
                footer={null}
                width={'auto'}
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}
            >
                {
                    withDrawInfo &&
                    <LiquidityWithdraw
                        swapPairKey={swapPairKey}
                        data={withDrawInfo}
                        onClose={onWithDrawClose}
                    />
                }
            </Modal>

        </Div>
    );
};

export default Liquidity;
