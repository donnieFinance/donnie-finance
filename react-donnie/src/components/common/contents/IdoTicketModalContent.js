import React, {useState, useEffect, useCallback} from 'react';
import {useTranslation} from "react-i18next";
import WalletUtil from "~/util/WalletUtil";
import useWallet from "~/hooks/useWallet";
import {useRecoilState} from "recoil";
import {connectWalletModalState} from "~/hooks/atomState";
import BigNumber from "bignumber.js";
import idoApi from "~/lib/idoApi";
import moment from "moment-timezone";
import ComUtil from "~/util/ComUtil";
import {HiOutlineTicket} from "react-icons/hi";
import {RiRefund2Line} from "react-icons/ri";
import iostApi from "~/lib/iostApi";
import {Button, Div, Flex, Hr, Img, Right, Span} from "~/styledComponents/shared";
import {Alert, Slider} from "antd";
import {HexEdge} from "~/styledComponents/shared/Shapes";
import {SymbolGroup} from "~/components/exchange/Components";
import {IoTicketSharp} from 'react-icons/io5'
import {RiCoupon3Line} from 'react-icons/ri'
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import Zigzag from '~/assets/zigzag.png'
import useSize from "~/hooks/useSize";
import useIdoTicketBalance from "~/hooks/useIdoTicketBalance";
import {BsFillExclamationTriangleFill} from "react-icons/bs";

const StyledSlider = styled(Slider)`
    .ant-slider-handle {        
        transform: translateX(-50%) scale(1.7)!important;
        border-color: ${color.info}!important;
    }
    .ant-slider-track {
        background-color: ${color.info}!important;
    }
`

const SymbolIdoTicket = () => <Div mr={5}><RiCoupon3Line color={color.dark} size={20}/></Div>

//토큰 심볼
const Symbol = ({ticketPoolObject}) => {
    return(
        <Div mr={5}>
            {
                ticketPoolObject.img && ticketPoolObject.tokenType === 'iw' &&
                <HexEdge width={35} height={35}>
                    <Img src={ticketPoolObject.img} style={{display: 'block', width: 20}}
                         alt={ComUtil.coinName(ticketPoolObject.name)}/>
                </HexEdge>
            }
            {
                ticketPoolObject.tokenType === 'lp' &&
                <SymbolGroup symbol1={ComUtil.getLpTokenNames(ticketPoolObject.tokenName)[0]} symbol2={ComUtil.getLpTokenNames(ticketPoolObject.tokenName)[1]} size={30}/>
            }
            {
                (ticketPoolObject.img && ticketPoolObject.tokenType !== 'lp' && ticketPoolObject.tokenType !== 'iw') &&
                <Img src={ticketPoolObject.img} style={{display: 'block', width: 20}} alt={ComUtil.coinName(ticketPoolObject.name)}/>
            }
            {
                ticketPoolObject.tokenName === 'IdoTicket' &&
                <IoTicketSharp color={color.info} size={25} />
            }
        </Div>
    )
}



const IdoTicketModalContent = ({ticketPoolObject, onClose}) => {

    const {sizeValue} = useSize()
    const {t} = useTranslation()
    const tMessage = t('message', {returnObjects: true})
    const tIdoMessage = t('idoMessage', {returnObjects: true})
    const [tokenBalance, setTokenBalance] = useState(0);

    //지갑의 잔고.
    const {idoTicketBalance, refetch: refetchIdoTicketBalance} = useIdoTicketBalance()
    // const [idoTicketBalance, setIdoTicketBalance] = useState(0);

    /////////// 이하 swap모달 용 ////////////////////////////
    const [errMessage,setErrMessage] = useState("");
    const [errMessageDesc,setErrMessageDesc] = useState("");

    //token input
    // const [tokenInputCount, setTokenInputCount] = useState(0);
    //swap모달의 swap1/swap2 버튼용
    const [swapDirection, setSwapDirection] = useState(1);
    //IdoTicket Input
    // const [idoTicketInputCount, setIdoTicketInputCount] = useState("");

    //stake된 토큰
    const [myStakedBalance, setMyStakedBalance] = useState(0);

    // 티켓 구매 및 반환 로딩 여부
    const [swapIdoTicketLoading, setSwapIdoTicketLoading] = useState(false);

    const {myWalletType,} = useState(WalletUtil.getMyWallet().walletType);
    const {isLogin, address} = useWallet()
    const [,setConnectWalletOpen] = useRecoilState(connectWalletModalState)

    // 총 구매가능한 티켓의 토큰 수
    const [availableMaxTokenBalance, setAvailableMaxTokenBalance] = useState(0)

    //티켓을 구매하기위해 사용한 토큰 수
    const [tokenInputCount, setTokenInputCount] = useState(0)
    // 구매하려는 티켓 수
    const [idoTicketInputCount, setIdoTicketInputCount] = useState(0)

    //componentDidMount
    useEffect(() => {
        // setSwapDirection(1) //모달에선: swap1(stake)가 기본
        getUserBalance()
    }, [address])

// idoTicket 개수바뀔때 호출 (계산)
//     useEffect(() => {
//         if (swapDirection == 1) {
//             if (idoTicketInputCount >= 0) {
//                 let needToken = parseInt(idoTicketInputCount) * parseInt(ticketPoolObject.price);
//                 if (needToken >= 0) {
//                     // console.log("needToken", needToken)
//                     // console.log("tokenBalance", tokenBalance)
//                     if (needToken > parseInt(tokenBalance)) {
//                         //alert(tIdoMessage.tokenNotEnough) //토큰이 부족합니다.
//                         //window.$message.success(tIdoMessage.tokenNotEnough);
//                         setErrMessage(tIdoMessage.tokenNotEnough)
//                         setErrMessageDesc("");
//                     } else {
//                         setErrMessage("")
//                         setErrMessageDesc("");
//                         setTokenInputCount(needToken);
//                     }
//                 }
//             }
//         }
//         if (swapDirection == 2) {
//             //stake수량 체크
//             if (idoTicketInputCount >= 0) {
//                 let needToken = parseInt(idoTicketInputCount) * parseInt(ticketPoolObject.price);
//                 if (myStakedBalance < needToken) {
//                     //'입력된 수량이 stake된 token수량보다 많습니다.')
//                     setErrMessage(tIdoMessage.inputTokenOver)
//                     setErrMessageDesc("");
//                 }
//                 else {
//                     setErrMessage("")
//                     setErrMessageDesc("");
//                     setTokenInputCount(needToken)
//                 }
//             }
//         }
//
//     }, [idoTicketInputCount])

    const getUserBalance = async () => {

        const promises = [
            iostApi.getTokenBalance({address: address, tokenName:ticketPoolObject.tokenName}),
            idoApi.getIdoTicketBalance(address),
            iostApi.getTradeUserStakeBalance(ticketPoolObject.pool, address)
        ]

        const res = await Promise.all(promises)

        const tokenBalance = res[0];        //총 지갑 토큰 물량
        const idoTicketBalance = res[1];    //총 ido 티켓 개수
        const stakedBalance = res[2];       //현제 토큰에서 스테이킹 하고있는 토큰 물량


        setTokenBalance(tokenBalance);
        //setIdoTicketBalance(idoTicketBalance);
        setMyStakedBalance(stakedBalance)

        let availableMaxTokenBalance;

        //총 구매가능 티켓의 토큰
        if (swapDirection === 1) {
            availableMaxTokenBalance = getAvailableMaxTokenBalance(tokenBalance)
        }else {
            availableMaxTokenBalance = myStakedBalance
        }

        setAvailableMaxTokenBalance(availableMaxTokenBalance)

        console.log({tokenBalance,idoTicketBalance,stakedBalance, availableMaxTokenBalance })

        return {
            tokenBalance,
            idoTicketBalance,
            stakedBalance,
            availableMaxTokenBalance
        }
    }

    const onSwapDirectionChange = (value) => {
        setSwapDirection(value)
        //
        setErrMessage('')
        setErrMessageDesc('')

        //input 초기화
        // setIdoTicketInputCount("");
        // setTokenInputCount(0);


        // //Stake(get ticket)
        // if (value === 1) {
        //     //(티켓을 구입하기위한)사용 가능한 토큰 수
        //     setAvailableMaxTokenBalance(getAvailableMaxTokenBalance(tokenBalance))
        //     //티켓을 구매하기 위해 슬라이더 움직인 토큰 수
        //     setUsedTokenBalance(0)
        //     //슬라이더 움직인 티켓 수
        //     setIdoTicketInputCount(0)
        // }
        // //Unstake
        // else  {
        //
        //     //(티켓을 구입하기위한)사용 가능한 토큰 수
        //     setAvailableMaxTokenBalance(myStakedBalance)
        //     //티켓을 구매하기 위해 슬라이더 움직인 토큰 수
        //     setUsedTokenBalance(0)
        //     //슬라이더 움직인 티켓 수
        //     setIdoTicketInputCount(0)
        // }
    }
    useEffect(() => {
        //Stake(get ticket)
        if (swapDirection === 1) {
            //(티켓을 구입하기위한)사용 가능한 토큰 수
            setAvailableMaxTokenBalance(getAvailableMaxTokenBalance(tokenBalance))
            //티켓을 구매하기 위해 슬라이더 움직인 토큰 수
            setTokenInputCount(0)
            //슬라이더 움직인 티켓 수
            setIdoTicketInputCount(0)
        }
        //Unstake
        else  {

            //(티켓을 구입하기위한)사용 가능한 토큰 수
            setAvailableMaxTokenBalance(myStakedBalance)
            //티켓을 구매하기 위해 슬라이더 움직인 토큰 수
            setTokenInputCount(0)

            //슬라이더 움직인 티켓 수
            setIdoTicketInputCount(0)
        }
    }, [swapDirection])


    //idoTicket 개수바뀔때 호출
    // const onTicketChange = (which, e) => {
    //     let {value} = e.target
    //     if(value < 1) {
    //         // setIdoTicketInputCount("");
    //         // setTokenInputCount(0);
    //     } else {
    //         // value = parseInt(value);
    //         // setIdoTicketInputCount(value);
    //     }
    // }

    //idoTiket MAX 클릭시.
    // const onMaxClick = async () => {
    //
    //     //stake시 MAX
    //     if (swapDirection == 1) {
    //         let value = new BigNumber(tokenBalance / ticketPoolObject.price).decimalPlaces(0, 1);  //1=내림 적용.
    //         setIdoTicketInputCount(value);
    //
    //         let needToken = value * ticketPoolObject.price;
    //         setTokenInputCount(needToken);
    //     }
    //     //unstake시 MAX
    //     else if (swapDirection == 2) {
    //
    //         setIdoTicketInputCount(idoTicketBalance)
    //         setTokenInputCount(idoTicketBalance*ticketPoolObject.price)
    //
    //         if (myStakedBalance < idoTicketBalance * ticketPoolObject.price) {
    //             //console.log('myStakedBalance:' + myStakedBalance + ' less than: ' + idoTicketBalance * ticketPoolObject.price)
    //             setTokenInputCount(myStakedBalance)
    //             setIdoTicketInputCount(myStakedBalance/ticketPoolObject.price)
    //         }
    //
    //     }
    //
    // }

    //stake(swap1)/unstake(swap2) 버튼동작
    const swapIdoTicket = async() => {
        // setErrMessage("");
        // setErrMessageDesc("");

        // 잔액을 다시 조회해서 비교
        const userBalance = await getUserBalance();

        //swap1 = stake ////////////////////////////////////////////////////////
        if (swapDirection === 1) {
            let needToken = idoTicketInputCount * ticketPoolObject.price;

            //console.log({needToken})

            if (needToken > parseInt(userBalance.tokenBalance)) {
                //alert(tIdoMessage.tokenNotEnough); //"현재 보유토큰보다 많은 토큰량입니다.");
                //window.$message.info(tIdoMessage.tokenNotEnough);
                setErrMessage(tIdoMessage.tokenNotEnough)
                setErrMessageDesc("");
                return false;
            }

            // console.log(pool, tokenInputCount, tokenName);
            setSwapIdoTicketLoading(true);
            const {result, isSuccess} = await idoApi.buyIdoTicket(ticketPoolObject.pool, tokenInputCount, ticketPoolObject.tokenName);
            // console.log({isSuccess: isSuccess, result:result});
            if (isSuccess) {
                window.$message.success('Success');
                //total ido Ticket 개수 업데이트
                refetchIdoTicketBalance()
                setSwapIdoTicketLoading(false);
                onClose();
            } else {
                setSwapIdoTicketLoading(false);
                window.$message.error('fail');
                let errorMessage = `${tMessage.failedToSend}`;
                if (typeof result === 'string') {
                    if (result.indexOf('{') > -1) {
                        let error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = `${tMessage.lackOfIgas} 200000 \n${tMessage.chargeIgasTime}`;
                            if (error.message) {
                                vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                            }
                            errorMessage = vFailedToSend
                        } else {
                            errorMessage = result
                        }
                    }
                } else if (typeof result === 'object') {
                    if (result.status_code === 'BALANCE_NOT_ENOUGH') {
                        errorMessage = `${tMessage.lackOfIram}`;
                    }else if (result.status_code === 'RUNTIME_ERROR') {
                        //20210628 추가.iwallet에러메시지 파싱. (Error: ~ \n 까지 파싱)
                        if (result.message && result.message.indexOf('Error:') > 0) {
                            let errMsgEnd = result.message.indexOf('\n', result.message.indexOf('Error:'));
                            errorMessage = result.message.substring(result.message.indexOf('Error:')+6, errMsgEnd);
                        }else {
                            errorMessage = `${tMessage.failedToSend}`;
                        }
                    } else {
                        errorMessage = `${tMessage.jetstreamFail}`;
                    }
                }
                alert(errorMessage)
            }
        }
        //swap2 = unstake ////////////////////////////////////////////////////////
        else if (swapDirection == 2){

            //stake수량 체크
            if (tokenInputCount > userBalance.myStakedBalance) {
                //'입력된 수량이 stake된 token수량보다 많습니다.')
                //window.$message.info(tIdoMessage.inputTokenOver);
                //alert(tIdoMessage.inputTokenOver)
                setErrMessage(tIdoMessage.inputTokenOver)
                setErrMessageDesc("");
                return;
            }

            //last_stake_time체크
            let userLastStakeTimeSec = await idoApi.getIdoTicketPoolLastStakeTime(ticketPoolObject.pool, address);
            if (userLastStakeTimeSec) {
                const now = moment().valueOf(); //밀리세컨드
                console.log('lst:now ' + (userLastStakeTimeSec + 24*3600*7)*1000 + ', ' + now);

                if ( (userLastStakeTimeSec + 24*3600*7)*1000 > now) {//일주일 체크
                    //'마지막 stake시간으로부터 일주일 이후에 unstake가 가능합니다.')
                    //window.$message.info(tIdoMessage.lastStakeTimeNotPasssed);
                    const vTimeDuration = (moment((userLastStakeTimeSec + 24*3600*7)*1000)).valueOf() - now;
                    const vTimeLeft = ComUtil.leftTime(vTimeDuration)
                    const limitedTime = ComUtil.countdown(vTimeLeft);
                    setErrMessage(tIdoMessage.lastStakeTimeNotPasssed)
                    setErrMessageDesc(`Time remaining ${limitedTime}`);
                    //alert(tIdoMessage.lastStakeTimeNotPasssed)
                    console.log("===============================3=================")
                    return;
                }
            }

            // unstake
            setSwapIdoTicketLoading(true);
            const {result, isSuccess} = await idoApi.withdrawWithTicket(ticketPoolObject.pool, idoTicketInputCount);
            if (isSuccess) {
                //total ido Ticket 개수 업데이트
                refetchIdoTicketBalance()
                setSwapIdoTicketLoading(false);
                window.$message.success('Success');
                onClose();

            } else {
                setSwapIdoTicketLoading(false);
                window.$message.error('fail');
                let errorMessage = `${tMessage.failedToSend}`;
                if (typeof result === 'string') {
                    if (result.indexOf('{') > -1) {
                        let error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                        if (error.code === 2) {
                            let vFailedToSend = `${tMessage.lackOfIgas} 200000 \n${tMessage.chargeIgasTime}`;
                            if (error.message) {
                                vFailedToSend = vFailedToSend + "\n" + error.message.toString();
                            }
                            errorMessage = vFailedToSend
                        } else {
                            errorMessage = result
                        }
                    }
                } else if (typeof result === 'object') {
                    if (result.status_code === 'BALANCE_NOT_ENOUGH') {
                        errorMessage = `${tMessage.lackOfIram}`;
                    }else if (result.status_code === 'RUNTIME_ERROR') {
                        //20210628 추가.iwallet에러메시지 파싱. (Error: ~ \n 까지 파싱)
                        if (result.message && result.message.indexOf('Error:') > 0) {
                            let errMsgEnd = result.message.indexOf('\n', result.message.indexOf('Error:'));
                            errorMessage = result.message.substring(result.message.indexOf('Error:')+6, errMsgEnd);
                        }else {
                            errorMessage = `${tMessage.failedToSend}`;
                        }
                    } else {
                        errorMessage = `${tMessage.jetstreamFail}`;
                    }
                }
                alert(errorMessage)
            }

        }

        // await getUserBalance(); //끝나고 한번 더 호출
    }

    const changeConnectWallet = () => {
        setConnectWalletOpen(true);
    }

    //모달 하단(swap) 버튼의 상태값 리턴
    const getSwapButtonErrorText = () => {  //참고 Swap.js
        const buttonState = {
            text: (swapDirection == 1)? t('idoTicketSwap1',{x:ComUtil.coinName(ticketPoolObject.tokenName)})
                : t('idoTicketSwap2',{x:ComUtil.coinName(ticketPoolObject.tokenName)}),
            disabled: false,
            icon: (swapDirection == 1) ? <HiOutlineTicket size={15} />:<RiRefund2Line size={15} />
        }

        // stake or unstake button 클릭시 초기화 세팅
        if(idoTicketInputCount === 0) buttonState.disabled = true
        if(tokenInputCount === 0) buttonState.disabled = true

        return buttonState;
    }


    //티켓 구매가능한 max 토큰 수
    function getAvailableMaxTokenBalance(balance) {
        return new BigNumber(balance / ticketPoolObject.price).decimalPlaces(0, 1).toNumber() * ticketPoolObject.price;  //1=내림 적용.
    }


    const onSliderChange = (value) => {
        setTokenInputCount(value)

        if (value === 0) {
            setIdoTicketInputCount(0)
            return
        }

        setIdoTicketInputCount(value / ticketPoolObject.price)
    }

    const getMarks = () => {
        return {
            0: {
                style: {
                    marginTop: 10
                },
                label: '0'
            },
            [availableMaxTokenBalance]: {
                style: {
                    marginTop: 10
                },
                label: `${availableMaxTokenBalance}`
            }
        };
    }

    const buttonState = getSwapButtonErrorText()

    const getTotalIdoBalance = () => {
        if (swapDirection === 1) {
            return parseFloat(idoTicketBalance) + parseFloat(idoTicketInputCount)
        }else {
            const idoTicketCount = parseFloat(idoTicketBalance) - parseFloat(idoTicketInputCount)
            if (idoTicketCount <= 0) {
                return 0;
            }
            return idoTicketCount
        }
    }

    return(
        <Div minWidth={sizeValue(400, 350, '320' )} relative>
            <Div p={16} bg={'light'}>
                <Flex fontSize={15} bc={'secondary'} justifyContent={'center'} py={8} rounded={3} bg={'white'}>
                    <Span>Your Total IDO Ticket :
                        <b>
                            {
                                getTotalIdoBalance()
                            }
                            {
                                (idoTicketInputCount !== 0) && (
                                    <Span fg={'info'}>
                                        {
                                            swapDirection === 1 ?
                                                ` (+${idoTicketInputCount})` :
                                                ` (-${idoTicketInputCount})`
                                        }
                                    </Span>
                                )
                            }
                        </b>
                    </Span>
                </Flex>
                <Div mt={16}>
                    <Div mb={3} bold>My Wallet</Div>
                    <Flex>
                        <Flex>
                            <Symbol ticketPoolObject={ticketPoolObject} />
                            <Div>{ticketPoolObject.tokenName.toUpperCase()}</Div>
                        </Flex>
                        <Right>{tokenBalance}</Right>
                    </Flex>
                </Div>


                <Div mt={16}>
                    <Div mb={3} bold>Staked</Div>
                    <Flex>
                        <Flex>
                            <Symbol ticketPoolObject={ticketPoolObject} />
                            <Div>{ticketPoolObject.tokenName.toUpperCase()}</Div>
                        </Flex>
                        <Right>{myStakedBalance}</Right>
                    </Flex>

                    <Flex mt={10}>
                        <Flex lineHeight={0}>
                            <SymbolIdoTicket />
                            <Div ml={5}>IDO Ticket</Div>
                        </Flex>
                        <Right>{myStakedBalance / ticketPoolObject.price}</Right>
                    </Flex>
                </Div>


            </Div>
            <Hr bc={'secondary'} custom={`border-style: dotted;`} />


            <Div p={16}>
                <Flex>
                    <Div width={'50%'}>
                        <Button rounded={0} shadow={swapDirection === 1 && 'sm'} bg={swapDirection === 1 ? 'info' : 'light'} fg={swapDirection === 1 ? 'white' : 'info'} block onClick={onSwapDirectionChange.bind(this, 1)}>
                            <Div>Stake and Receive Ticket</Div>
                        </Button>
                    </Div>
                    <Div width={'50%'}>
                        <Button rounded={0} shadow={swapDirection === 2 && 'sm'}  bg={swapDirection === 2 ? 'info' : 'light'} fg={swapDirection === 2 ? 'white' : 'info'} block onClick={onSwapDirectionChange.bind(this, 2)}>
                            <Div>Unstake and Return Ticket</Div>
                        </Button>
                    </Div>
                </Flex>
                {/*<Div>*/}
                {/*    {*/}
                {/*        myStakedBalance !== 0 &&*/}
                {/*        <Radio.Group buttonStyle="solid" onChange={onSwapDirectionChange} value={swapDirection}>*/}
                {/*            {*/}
                {/*                myStakedBalance !== 0 &&*/}
                {/*                <Radio.Button value={1}><HiOutlineTicket />Stake(get ticket)</Radio.Button>*/}
                {/*            }*/}

                {/*            {*/}
                {/*                myStakedBalance > 0 &&*/}
                {/*                <Radio.Button value={2}><RiRefund2Line />UnStake</Radio.Button>*/}
                {/*            }*/}
                {/*        </Radio.Group>*/}
                {/*    }*/}
                {/*</Div>*/}

                <Div fg={'darkMid'} my={16} textAlign={'center'} fontSize={12}>{ticketPoolObject.price} {ticketPoolObject.tokenName} = 1 IDO Ticket</Div>

                <Flex mt={16} relative>
                    <Div absolute></Div>
                    <Div flexBasis={'50%'}>
                        <Flex justifyContent={'center'}>
                            <Symbol ticketPoolObject={ticketPoolObject} />
                            <Div fontSize={15}>{ComUtil.coinName(ticketPoolObject.tokenName)}</Div>
                        </Flex>
                        <Div fontSize={17} bold pt={10} textAlign={'center'}>{tokenInputCount}</Div>
                    </Div>
                    <Div flexBasis={'50%'}>
                        <Flex justifyContent={'center'}>
                            <SymbolIdoTicket />
                            <Span>IDO Ticket</Span>
                        </Flex>
                        <Div fontSize={17} bold pt={10} textAlign={'center'}>{idoTicketInputCount}</Div>
                    </Div>
                </Flex>


                <Div py={20} px={10}>
                    <StyledSlider defaultValue={0}
                                  disabled={false}
                                  step={ticketPoolObject.price}   //티켓 배수 가격으로 snap이 걸리도록 지정
                                  max={availableMaxTokenBalance}  //구매가능한 티켓의 총 토큰 개수
                                  tipFormatter={(value) => `${value > 0 ? ((value / availableMaxTokenBalance) * 100).toFixed(1) : 0}%`}
                        // tooltipVisible={false}
                                  marks={getMarks()}
                                  onChange={onSliderChange}
                                  value={tokenInputCount}
                                  disabled={availableMaxTokenBalance <= 0}
                    />
                </Div>


                <Flex mb={8} fg={'love'} alignItems={'flex-start'}>
                    <Div mr={5} pt={1}>
                        <BsFillExclamationTriangleFill />
                    </Div>
                    {t('lstDesc')}

                </Flex>
                <Div mb={16}>
                    {(address)?
                        <Button bg={'primary'} fg={'white'} block rounded={2} onClick={swapIdoTicket}
                                disabled={tokenInputCount <= 0 || swapIdoTicketLoading}>
                            {buttonState.text}
                        </Button>
                        :  <Button bg={'primary'} fg={'white'} block rounded={2} onClick={changeConnectWallet} >
                            {t('connectWallet')}
                        </Button>
                    }
                </Div>
                <Div mb={16}>
                    {/*{*/}
                    {/*    errMessage && <Div bc={'danger'} bg={'#FFF2F0'} p={10}>*/}
                    {/*        <Div bold>{errMessage}</Div>*/}
                    {/*        <Div>{errMessageDesc}</Div>*/}
                    {/*    </Div>*/}
                    {/*}*/}
                    {
                        errMessage && <Alert message={errMessage} description={errMessageDesc} type="error" showIcon/>
                    }
                </Div>
            </Div>




            {/*<Div> {ticketPoolObject.price} {ticketPoolObject.tokenName} = 1 IdoTicket</Div>*/}




            {/*<Flex justifyContent={'center'} mt={10}>*/}
            {/*    /!* From *!/*/}
            {/*    <Div rounded={5} bg={'white'} p={2} bc={'black'}>*/}
            {/*        <IdoTicketTokenBox*/}
            {/*            title={'From'}*/}
            {/*            totalBalance={tokenBalance}*/}
            {/*            img={ticketPoolObject.img}*/}

            {/*            name={ticketPoolObject.name}*/}
            {/*            tokenType={ticketPoolObject.tokenType}*/}
            {/*            tokenName={ticketPoolObject.tokenName}*/}
            {/*            count={tokenInputCount}*/}
            {/*            myStakedBalance = {myStakedBalance}*/}

            {/*            swapDirection = {swapDirection}*/}
            {/*            showMax={false}*/}
            {/*            readOnly={true}*/}

            {/*        />*/}
            {/*    </Div>*/}
            {/*    <Div>*/}
            {/*        {*/}
            {/*            swapDirection == 1 && <RiArrowRightFill bold size={20}/>*/}
            {/*        }*/}
            {/*        {*/}
            {/*            swapDirection == 2 && <RiArrowLeftFill bold size={20}/>*/}
            {/*        }*/}
            {/*    </Div>*/}
            {/*    {*/}
            {/*        (swapDirection == 1 || swapDirection == 2) &&*/}
            {/*        <>*/}
            {/*            <Div rounded={5} bg={'white'} p={2} bc={'black'}>*/}
            {/*                <Div flexShrink={0} fontSize={14}>*/}
            {/*                    <Flex>*/}
            {/*                        <Flex bg={'white'} height={34} alignItems={'center'} justifyContent={'space-between'}  >*/}
            {/*                            <HiOutlineTicket size={25} /><Span ml={5}>idoTicket</Span>*/}
            {/*                        </Flex>*/}
            {/*                    </Flex>*/}
            {/*                </Div>*/}
            {/*                <Flex fontSize={16} mt={10}>*/}
            {/*                    <Div flexGrow={1}>*/}
            {/*                        <Input*/}
            {/*                            type={'number'}*/}
            {/*                            inputMode="numeric" pattern="[0-9]*"*/}
            {/*                            step="1"*/}
            {/*                            block*/}
            {/*                            bold*/}
            {/*                            placeholder={0.0}*/}
            {/*                            bc={'white'}*/}
            {/*                            bg={'white'}*/}
            {/*                            fc={'gray'}*/}
            {/*                            fg={'gray'}*/}
            {/*                            height={'100%'}*/}
            {/*                            p={0}*/}
            {/*                            height={34}*/}
            {/*                            style={{fontSize:16, cursor: 'not-allowed'}}*/}
            {/*                            readOnly={true}*/}
            {/*                            value={idoTicketInputCount||0}*/}
            {/*                        />*/}
            {/*                    </Div>*/}
            {/*                </Flex>*/}
            {/*                <Div>*/}
            {/*                    (Balance: {myStakedBalance / ticketPoolObject.price})*/}
            {/*                </Div>*/}
            {/*            </Div>*/}

            {/*        </>*/}
            {/*    }*/}
            {/*</Flex>*/}

            {/* 지그재그 */}
            <Div absolute bottom={-9} width={'100%'} height={20}>
                <ZigZagBackground />
            </Div>
        </Div>
    )
}
export default IdoTicketModalContent;

const ZigZagBackground = () => {
    return(
        <Div width={'100%'} height={'100%'} custom={`
               background: url(${Zigzag}) repeat;
        `}>
        </Div>
    )
}