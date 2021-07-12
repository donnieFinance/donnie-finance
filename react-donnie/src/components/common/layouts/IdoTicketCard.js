import React, {useState, useEffect} from 'react';
import {Button, Div, Flex, Img, Input, Right, Span} from "~/styledComponents/shared";
import {HexEdge} from '~/styledComponents/shared/Shapes'
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import aniKey from "~/styledComponents/Keyframes";
import {Alert, Modal, Radio, Space, Button as AntdButton} from 'antd';
import {SymbolGroup} from "~/components/exchange/Components";
import {HiOutlineTicket} from "react-icons/hi"
import {RiRefund2Line} from "react-icons/ri"
import {useTranslation} from "react-i18next";
import WalletUtil from "~/util/WalletUtil";
import iostApi from "~/lib/iostApi";
import idoApi from "~/lib/idoApi";
import useWallet from "~/hooks/useWallet";
import BigNumber from "bignumber.js";
import moment from "moment-timezone";
import {useRecoilState} from "recoil";
import {connectWalletModalState} from "~/hooks/atomState";
import {RiArrowRightFill, RiArrowLeftFill,RiArrowRightLine, RiArrowLeftLine} from "react-icons/ri";
import { Slider, Switch } from 'antd';
import IdoTicketModalContent from '~/components/common/contents/IdoTicketModalContent'
import {getValue} from "~/styledComponents/Util";
import useSize from "~/hooks/useSize";
const Content = styled(Flex)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
    justify-content: center;
`;

const IdoTicketCard = ({
                           name, //poolName = tokenName과 비슷
                           ticketPoolObject,

                       }) => {

    const {t} = useTranslation()
    const tMessage = t('message', {returnObjects: true})
    const tIdoMessage = t('idoMessage', {returnObjects: true})
    const [swapModal, setSwapModal] = useState(false)
    const [showDetail, setShowDetail] = useState(false)
    const [tokenBalance, setTokenBalance] = useState(0);

    const {size} = useSize()

    // //지갑의 잔고.
    // const [idoTicketBalance, setIdoTicketBalance] = useState(0);

    /////////// 이하 swap모달 용 ////////////////////////////
    // const [errMessage,setErrMessage] = useState("");
    // const [errMessageDesc,setErrMessageDesc] = useState("");

    //token input
    // const [tokenInputCount, setTokenInputCount] = useState(0);
    //swap모달의 swap1/swap2 버튼용
    // const [swapDirection, setSwapDirection] = useState(1);
    //IdoTicket Input
    // const [idoTicketInputCount, setIdoTicketInputCount] = useState("");

    //stake된 토큰
    const [myStakedBalance, setMyStakedBalance] = useState(0);


    // const {myWalletType,} = useState(WalletUtil.getMyWallet().walletType);
    const {isLogin, address} = useWallet()
    const [,setConnectWalletOpen] = useRecoilState(connectWalletModalState)

    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    //componentDidUpdate
    useEffect(() => {
        getSearch();
    }, [address])

    const getSearch = async () => {
        //상단: idoTicket Pool에 stakeBalance 찾기. : login되었을때만
        if (ticketPoolObject.pool && isLogin()) {
            const stakedBalance = await iostApi.getTradeUserStakeBalance(ticketPoolObject.pool, address)
            // jaden : properties.js 는 항상 readOnly 이어야 합니다. 부모쪽에서 넘어오는게 object 라서 properties.js를 사용하는 모든게 변경되어 버림. => 아래 설정 되어있던 state를 이용 하도록 변경함.
            // ticketPoolObject.stakedBalance = stakedBalance ; //필드추가.
            setMyStakedBalance(stakedBalance)
        }
    }



    //모달 띄우기
    const onSwapClick = async () => {
        // alert('click')
        // getUserBalance();
        setSwapModal(true);
    }
    //모달 닫기
    const onSwapClose = () => {
        // setSwapDirection(1); //모달에선: swap1(stake)가 기본
        // setIdoTicketInputCount("");
        // setTokenInputCount(0);
        // setErrMessage("");
        // setErrMessageDesc("");
        setSwapModal(false);
    }

    const onDetailClick = () => {
        setShowDetail(!showDetail)
    }

    const Symbol = ({size}) => {
        if(size && size === 'small'){
            if (ticketPoolObject.tokenType === 'iw') {
                return(
                    <HexEdge width={35} height={35}>
                        <Img src={ticketPoolObject.img} style={{display: 'block', width: 20}} alt={ComUtil.coinName(ticketPoolObject.name)}/>
                    </HexEdge>
                )
            }else if (ticketPoolObject.tokenType === 'lp') {
                const lpTokenNames = ComUtil.getLpTokenNames(ticketPoolObject.tokenName)
                return <SymbolGroup symbol1={lpTokenNames[0]} symbol2={lpTokenNames[1]} size={30} />
            }else {
                return <Img src={ticketPoolObject.img} style={{display: 'block', width: 20}}  alt={ComUtil.coinName(ticketPoolObject.name)}/>
            }
        }else {
            if (ticketPoolObject.tokenType === 'iw') {
                return (
                    <HexEdge width={40} height={40}>
                        <Img src={ticketPoolObject.img} width={20} height={20}
                             alt={ComUtil.coinName(ticketPoolObject.name)}/>
                    </HexEdge>
                )
            } else if (ticketPoolObject.tokenType === 'lp') {
                const lpTokenNames = ComUtil.getLpTokenNames(ticketPoolObject.tokenName)
                return <SymbolGroup symbol1={lpTokenNames[0]} symbol2={lpTokenNames[1]} size={40}/>
            } else {
                return <Img src={ticketPoolObject.img} width={40} height={40}
                            alt={ComUtil.coinName(ticketPoolObject.name)}/>
            }
        }
    }





    return (
        <Div >

            {/* IdoTicket 카드 (Small Card)*/}
            <Flex
                custom={size !== 'sm' && `
                    transition: 0.2s;
                    &:hover {
                        transform: scale(1.2);
                        z-index: 1;
                    }
                `}
                flexDirection={'column'}
                justifyContent={'space-between'}
                // minHeight={170}
                bg={'white'}
                rounded={10}
                fg={'black'} shadow={'lg'}
            >

                <Flex flexDirection={'column'}
                      justifyContent={'center'}
                      px={10}
                      py={15}
                >
                    <Div><Symbol /></Div>
                    <Div mt={6} fontSize={16} bold>{ComUtil.coinName(name)}</Div>
                    <Div fontSize={12} mt={5} fg={'darkMid'}>
                        1 IDO Ticket = {ticketPoolObject.price} {ticketPoolObject.tokenName}
                    </Div>
                </Flex>



                <Div width={'100%'} bc={'light'}
                     br={0} bl={0} bb={0}>
                    {
                        // !address &&
                        // <Button block bg={'white'} fg={'primary'}  rounded={10} bold fontSize={14} onClick={changeConnectWallet} >
                        //     {t('connectWallet')}
                        // </Button>
                    }
                    {
                        <Button block px={5} custom={`border-radius: ${getValue(0)} ${getValue(0)} ${getValue(10)} ${getValue(10)}`}
                                bg={'white'}
                                fg={myStakedBalance ? 'donnie' : 'primary'}
                                px={5}
                                py={10}

                                onClick={onSwapClick}>
                            <b>{t('swapIdoTicket')}</b>
                        </Button>
                    }
                </Div>
            </Flex>


            {/* stake/unstake 모달 */}
            <Modal
                title={
                    <Flex>
                        <Symbol size={'small'} />
                        <Div lineHeight={25} ml={8} mb={-3}>{t('swapIdoTicket')}</Div>
                    </Flex>
                }
                visible={swapModal}
                onCancel={onSwapClose}
                bodyStyle={{padding: 0}}
                footer={null}
                width={'auto'}
                centered={true}
                focusTriggerAfterClose={true}
                getContainer={false}
                maskClosable={false}
                destroyOnClose={true}
            >
                {
                    swapModal &&
                    <IdoTicketModalContent ticketPoolObject={ticketPoolObject} onClose={onSwapClose} />
                }

            </Modal>
        </Div>
    )
};






export default IdoTicketCard;
