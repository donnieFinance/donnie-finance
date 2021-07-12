import React, {useEffect, useState, useCallback} from 'react';
import {Div, Span, Flex, Hr, A, Link, Right, Button as StyledButton} from "~/styledComponents/shared";
import PageHeading from "~/components/common/layouts/PageHeading";
import {withTranslation} from "react-i18next";
import IdoKycApply from "./IdoKycApply";
import IdoSwap from "./IdoSwap"
import properties from "~/properties";
import {Modal, Button, Card, Alert, Space, Skeleton, Progress, Badge, Tooltip} from "antd";
import idoApi, {applyWhitelist, getUserOriginTicket, checkUserWhiteListedKyc, checkDrawFinished, alreadyIdoBought, backendKycAuthStatus} from "~/lib/idoApi"
import useModal from "~/hooks/useModal";
import useSize from "~/hooks/useSize";
import {useParams, withRouter} from "react-router-dom";
import useWallet from "~/hooks/useWallet";
import ComUtil from "~/util/ComUtil";
import useInterval from "~/hooks/useInterval";
import WalletUtil from "~/util/WalletUtil";
import {BsQuestionCircle} from "react-icons/bs";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";



function ProcessCircle({circleLeft, textTop, active, children}) {
    return(
        <>
            <Div absolute left={`${circleLeft}%`} top={'50%'} width={15} height={15} rounded={'50%'} bc={'donnie'} bw={2} bg={active ? 'donnie' : 'white'} custom={` transform: translate(-50%, -50%); `}></Div>
            <Div absolute left={`${circleLeft}%`} top={textTop} width={'max-content'}  custom={`transform: translate(-50%, -50%);`}>{children}</Div>
        </>
    )
}

const IdoDetail = withTranslation()(({t, history}) => {

    const {sizeValue} = useSize()
    const {myWalletType, setMyWalletType} = useState(WalletUtil.getMyWallet().walletType);
    const {isLogin, address} = useWallet()

    // lang (en or ko)
    const {ido:tMemuIdo} = t('menu', {returnObjects: true})
    const tMessage = t('message', {returnObjects: true})
    const tIdoMessage = t('idoMessage', {returnObjects: true})
    const lang = t('ido', {returnObjects: true})

    // 티켓 보유량 가져오기 (공통훅스)
    const [ticketBalance, setTicketBalance] = useState(0);

    // KYC 제출 모달
    const [kycModalOpen, setKycModalOpen, kycIdoIdSelected, setKycIdoIdSelected,] = useModal();
    // 스왑 모달
    const [swapModal, setSwapModal] = useState(false)

    //파라미터로 넘어온 IDO Key history
    const {uniqueKey} = useParams()
    const idoContract = uniqueKey ? properties.idoList[uniqueKey]:null;
    //IDO Key 로 idoId를 찾기
    const [idoID,setIdoID] = useState(idoContract?idoContract.idoId:null);

    // IDO 전체 상태 state:(0:open전, 1:running, 2:finished), value:duration, text:countdown
    const [idoStatus,setIdoStatus] = useState(idoContract && ComUtil.getIdoDurationDate(idoContract.applyWhitelistStart, idoContract.buyIdoEnd));

    const [boughtIdoToken,setBoughtIdoToken] = useState(0);

    // apply기간:true 아니면 false
    const [idoWhiteListApplyStatus,setIdoWhiteListApplyStatus] = useState(idoContract && ComUtil.getDurationBetweenDate(idoContract.applyWhitelistStart, idoContract.applyWhitelistEnd));

    // IDO 추첨완료여부
    const [isIdoCheckDrawFinished,setIsIdoCheckDrawFinished] = useState(false);

    // 티켓카운트가 0 이면 신청X, 0이상이면 신청O
    const [ticketCnt,setTicketCnt] = useState(0);
    // 추첨당첨여부
    const [actionWhiteListChkState,setActionWhiteListChkState] = useState(false);
    // 추첨당첨여부, KYC까지 승인
    const [actionWhiteListKycChkState,setActionWhiteListKycChkState] = useState(false);

    // 신청여부 버튼
    const [actionWhiteListDisabledState,setActionWhiteListDisabledState] = useState(true);
    // KYC 버튼
    const [actionKYCDisabledState,setActionKYCDisabledState] = useState(true);
    // IdoJoin 버튼
    const [actionIdoJoinDisabledState,setActionIdoJoinDisabledState] = useState(true);
    // claim Token 버튼
    const [actionClaimDisabledState,setActionClaimDisabledState] = useState(true);

    // alert info success error 문구
    const [whiteListStateType,setWhiteListStateType] = useState("error");
    const [whiteListStateText,setWhiteListStateText] = useState("");
    const [kycStateType,setKycStateType] = useState("error");
    const [kycStateText,setKycStateText] = useState("");
    const [idoJoinStateType,setIdoJoinStateType] = useState("error");
    const [idoJoinStateText,setIdoJoinStateText] = useState("");

    // 스켈레톤 로딩
    const [skeletonLoading,setSkeletonLoading] = useState(false);


    // 화이트리스트, kyc, idojoin 상태값
    const [applyWhiteListDurationStatus,setApplyWhiteListDurationStatus] = useState(idoContract && ComUtil.getDurationBetweenDate(idoContract.applyWhitelistStart,idoContract.applyWhitelistEnd));
    //const [kycDurationStatus,setKycDurationStatus] = useState(idoContract && ComUtil.getDurationEndDate(idoContract.kycEnd));
    const [kycDurationStatus,setKycDurationStatus] = useState(idoContract && ComUtil.getDurationBetweenDate(idoContract.applyWhitelistEnd, idoContract.kycEnd));
    const [idoJoinDurationStatus,setIdoJoinDurationStatus] = useState(idoContract && ComUtil.getDurationBetweenDate(idoContract.buyIdoStart,idoContract.buyIdoEnd));

    // 지갑 irc 연결시 상태 랜더링
    useEffect(() => {
        getSearch();
    }, [address, myWalletType])

    //각 상태별 변경시 조회
    useEffect(() => {
        getWhiteListStatus();
    }, [
        idoStatus && idoStatus.status,
        applyWhiteListDurationStatus && applyWhiteListDurationStatus.rangeState,
        kycDurationStatus && kycDurationStatus.rangeState,
        idoJoinDurationStatus && idoJoinDurationStatus.rangeState
    ])

    //1초에 한번씩 IdoStatus, ApplyWhiteListDate, KYCEndDate, IDOJoinDate 업데이트
    useInterval(() => {
        getIdoStatusSearch();
    }, 1000)
    //10분 마다 getWhiteListStatus 호출 (혹시나 대기하고 있는 사용자가 있는경우)
    useInterval(() => {
        getWhiteListStatus();
    }, 1000 * 60 * 10)

    function ProcessLineMobile() {
        return(
            <>
                <ProcessCircle circleLeft={0} active={applyWhiteListDurationStatus.rangeState !== 2} textTop={24}>Ticket Purchase</ProcessCircle>
                <ProcessCircle circleLeft={25} active={applyWhiteListDurationStatus.rangeState !== 2} textTop={-20}><StyledButton bg={'primary'} fg={'white'} px={10} py={2} rounded={10} custom={`& a {color:white;}`}><A href={idoContract.surveyUrl} target={'_blank'}>Whitelist Survey</A></StyledButton></ProcessCircle>
                <ProcessCircle circleLeft={50} active={applyWhiteListDurationStatus.rangeState === 1} textTop={24}>Whitelist Draw</ProcessCircle>
                <ProcessCircle circleLeft={75} active={kycDurationStatus.rangeState === 1} textTop={-20}>KYC</ProcessCircle>
                <ProcessCircle circleLeft={100} active={idoJoinDurationStatus === 1} textTop={24}>Join IDO</ProcessCircle>
            </>
        )
    }

    // 각 항목별 시간 갱신 및 상태값 세팅
    const getIdoStatusSearch = async () => {
        if(idoContract) {
            const afterIdoStatus = idoContract && ComUtil.getIdoDurationDate(idoContract.applyWhitelistStart, idoContract.buyIdoEnd);
            const afterApplyWhitelistStatus = idoContract && ComUtil.getDurationBetweenDate(idoContract.applyWhitelistStart, idoContract.applyWhitelistEnd)
            const afterKycDurationStatus = idoContract && ComUtil.getDurationBetweenDate(idoContract.applyWhitelistEnd, idoContract.kycEnd);
            const afterIdoJoinDurationStatus = idoContract && ComUtil.getDurationBetweenDate(idoContract.buyIdoStart,idoContract.buyIdoEnd);

            // 전체 상태가 만기 되었을경우 갱신
            // Apply WhiteList 상태가 만기 되었을경우 갱신
            // KYC 상태가 만기 되었을경우 갱신
            // IDO Join 상태가 만기 되었을경우 갱신

            // ido 전체 시간 상태 [0:open전, 1:running, 2:finished]
            setIdoStatus(afterIdoStatus)

            // ido running 중일경우
            // ApplyWhiteListDate, KYCEndDate, IDOJoinEndDate 시간
            setApplyWhiteListDurationStatus(afterApplyWhitelistStatus);

            setKycDurationStatus(afterKycDurationStatus);
            setIdoJoinDurationStatus(afterIdoJoinDurationStatus);
        }
    }

    const getSearch = async () => {
        setSkeletonLoading(true);

        await getIdoStatusSearch();
        await getWhiteListStatus();

        setSkeletonLoading(false);

    }

    const getWhiteListStatus = async () =>{


        let myTicketBalance = 0;
        if(address) {
            const myTicketBalanceData = await idoApi.getIdoTicketBalance(address)
            myTicketBalance = myTicketBalanceData;
            setTicketBalance(myTicketBalance);
            //console.log("myTicketBalanceData1===",myTicketBalanceData)
        }

        if (idoContract && idoContract.buyIdoContract) {
            const vTotalIdoLeft = await idoApi.getTotalIdoLeft(idoContract.buyIdoContract);
            const vBoughtIdoToken = idoContract.totalIdoToken - vTotalIdoLeft;
            setBoughtIdoToken(vBoughtIdoToken.toFixed(0))
        }

        // IDO 추첨완료여부 상태
        const resCheckDrawFinished = await checkDrawFinished(idoContract && idoContract.applyWhitelistContract);
        let vCheckDrawFinished = false;
        if(resCheckDrawFinished !== null){
            console.log("resCheckDrawFinished===",resCheckDrawFinished)
            vCheckDrawFinished = resCheckDrawFinished;
            setIsIdoCheckDrawFinished(resCheckDrawFinished);
        }

        // irc 지갑 주소 연동 체크
        if(address) {
            if(myTicketBalance >= 0) {
                if (!(myTicketBalance >= idoContract.minIdoTicket && myTicketBalance <= idoContract.maxIdoTicket)) {
                    // setWhiteListStateText(`ticket must be beetween ${idoContract.minIdoTicket} ~ ${idoContract.maxIdoTicket}`);
                    setWhiteListStateText(t(tIdoMessage.needTicket,{x:idoContract.minIdoTicket, y:idoContract.maxIdoTicket}));
                } else {
                    setWhiteListStateText("");
                }
            }

            // 해당 IDO 상태 [0:open전, 2:finished]
            if(idoStatus && (idoStatus.state == 0 || idoStatus.state == 2)){
                setActionKYCDisabledState(true);
                setActionIdoJoinDisabledState(true);
            }
            // 해당 IDO 상태  [1:running]
            if(idoStatus && idoStatus.state >= 1) {

                // 신청기간이 아닐경우 버튼 비활성화
                if(idoWhiteListApplyStatus.rangeState != 1){
                    setActionWhiteListDisabledState(true);
                }

                // 1. 신청한 티켓카운트가 0이면 신청안한것, 0이상일경우 추첨여부랑 KYC체크
                const resWhiteListTicketCount = await getUserOriginTicket(idoContract.applyWhitelistContract, address);
                //console.log("resWhiteListTicketCount==",resWhiteListTicketCount)
                if (resWhiteListTicketCount === null) {
                    console.slog('resWhiteListTicketCount NULL:' + idoContract.applyWhitelistContract + ',' + address);
                    return; //error
                }
                if(resWhiteListTicketCount == 0){
                    if(vCheckDrawFinished) {
                        setActionWhiteListDisabledState(true);
                        setWhiteListStateType("error");
                    }else {
                        //신청기간일경우 신청버튼 활성화
                        if (idoWhiteListApplyStatus.rangeState == 1) {
                            setActionWhiteListDisabledState(false);
                            setWhiteListStateType("info");
                        }
                    }
                    return; //아래 else if 제거용.
                }

                //2. whiteList 신청상태일 경우 ///////////////////
                setTicketCnt(resWhiteListTicketCount);
                setWhiteListStateType("success");
                setWhiteListStateText(t(tIdoMessage.whitelistApplied, {x:resWhiteListTicketCount}))//setWhiteListStateText("WhiteList applied with " + resWhiteListTicketCount + " ticket.")

                setKycStateText(tIdoMessage.waitingDraw) //setKycStateText("Waiting for whitelist drawing lots.")

                if(vCheckDrawFinished) {
                    setActionWhiteListDisabledState(true);
                }else{
                    if (idoWhiteListApplyStatus.rangeState === 1) {
                        // 티켓보유량 (전체)
                        //console.log("myTicketBalance",myTicketBalance)
                        // 티켓보유량 범위티켓 조건에 해당될 경우
                        if (
                            myTicketBalance > 0 &&
                            (myTicketBalance >= idoContract.minIdoTicket &&
                                myTicketBalance <= idoContract.maxIdoTicket)
                        ) {
                            // console.log("resWhiteListTicketCount1==",resWhiteListTicketCount)
                            // console.log("myTicketBalance1==",myTicketBalance)
                            //신청량보다 보유량이 컸을경우 신청버튼 활성화
                            if (resWhiteListTicketCount < myTicketBalance) {
                                setActionWhiteListDisabledState(false);
                            } else {
                                setActionWhiteListDisabledState(true);
                            }
                        }
                    }
                }

                //2. 결과값이 true이면 whitelist에 뽑힌 것, kyc이면 kyc까지 완료한 user
                const resWhiteAndKyc = await checkUserWhiteListedKyc(idoContract.applyWhitelistContract, address);
                //console.log("checkUserWhiteListedKyc===", resWhiteAndKyc)


                // if (resWhiteAndKyc === null) {
                //     console.log("checkUserWhiteListedKyc=== is NULL ")
                //     return; //do nothing,
                // }


                // 추첨이 되었으면 KYC 제출버튼 활성화
                if (resWhiteAndKyc === "true" ) { //|| resWhiteAndKyc === "kyc") {
                    setActionWhiteListChkState(true);   //당첨여부 체크 (당첨true)
                    setActionKYCDisabledState(false);
                    setKycStateType("info");
                    setKycStateText("please apply KYC");

                    setWhiteListStateType("success");

                    if(resWhiteListTicketCount > 0){
                        //setWhiteListStateText("you are whiteListed. (" + resWhiteListTicketCount + " ticket)")
                        setWhiteListStateText(t(tIdoMessage.whitelistDone, {x:resWhiteListTicketCount}));
                    }else{
                        setWhiteListStateText(`Whitelist Winner, Completed Whitelist.`); //만약대비
                    }

                    //혹시 kyc거절시에 try again 유도.
                    const {data:kycStatus} = await backendKycAuthStatus(idoID, address);
                    //console.log('kycStatus:' + kycStatus);

                    if (kycStatus.kycAuth == 1) {  //KYC 신청중인 상태
                        setActionKYCDisabledState(true);
                        setKycStateType("info");
                        setKycStateText(tIdoMessage.kycProgress);//"your KYC is in review.")
                    }
                    else if (kycStatus.kycAuth == -1) { //KYC 거절상태
                        setKycStateType("error");
                        setKycStateText(t(tIdoMessage.kycRejected,{x:kycStatus.kycReason}));//"KYC rejected, try again. Reason: " + kycStatus.kycReason);
                    }


                }
                // 추첨이 되었고 KYC 완료가 되었으면 kyc버튼 비활성화
                else if (resWhiteAndKyc === "kyc") {
                    setActionWhiteListKycChkState(true); //당첨및KYC승인
                    setActionKYCDisabledState(true);
                    setKycStateType("success");
                    setKycStateText(tIdoMessage.kycDone);//"your KYC is done.");

                    if(resWhiteListTicketCount > 0){
                        setWhiteListStateText(t(tIdoMessage.whitelistDone, {x:resWhiteListTicketCount}));//"you are whiteListed. (" + resWhiteListTicketCount + " ticket)")
                    }else{
                        setWhiteListStateText(`Whitelist Winner, Completed Whitelist`);
                    }

                    //idoJoin 상태 여부 체크하여 IDO JOIN 버튼 활성화
                    const resAlreadyIdoBought = await alreadyIdoBought(idoContract.buyIdoContract, address)
                    //console.log("resAlreadyIdoBought===",resAlreadyIdoBought)
                    if(resAlreadyIdoBought != null){
                        if (parseFloat(resAlreadyIdoBought) > 0) {
                            setActionIdoJoinDisabledState(true);
                            setIdoJoinStateType("info");
                            //let idoBoughtCount = ComUtil.roundTokenCount(resAlreadyIdoBought) + " " + idoContract.tokenName;
                            let idoBoughtCount = resAlreadyIdoBought + " " + ComUtil.idoTokenName(idoContract.tokenName);
                            setIdoJoinStateText(t(tIdoMessage.idoRequestDone,{x:idoBoughtCount})); //"Purchase Request done (" + idoBoughtCount + ")");

                            // claim 가능기간이면 claim 여부 조회 후 claim 버튼 활성화
                            const startClaim = await idoApi.canClaimToken(idoContract.buyIdoContract);
                            if(startClaim) {
                                const alreadyClaim = await idoApi.alreadyClaim(idoContract.buyIdoContract, address);
                                if(!alreadyClaim) {
                                    setActionClaimDisabledState(false);
                                    setIdoJoinStateType("info");
                                    setIdoJoinStateText(t(tIdoMessage.claimIdo,{x:idoBoughtCount}));//"please claim IDO token");
                                }else {
                                    setActionClaimDisabledState(true);
                                    setIdoJoinStateType("success");
                                    let idoBoughtCount = resAlreadyIdoBought + " " + idoContract.tokenName;
                                    setIdoJoinStateText(t(tIdoMessage.idoDone,{x:idoBoughtCount})); //" IDO done(" + idoBoughtCount + ")");
                                }
                            }
                        }
                    }else {
                        if(idoJoinDurationStatus.rangeState === 1){
                            setActionIdoJoinDisabledState(false);
                            setIdoJoinStateType("info");
                            setIdoJoinStateText(t(tIdoMessage.joinIdo,{x:idoContract.payingToken}));//"please swap IDO token");
                        }

                        // 기간 종료되었을경우 버튼 비활성
                        if(idoJoinDurationStatus.rangeState === 2){
                            setActionIdoJoinDisabledState(true);
                            setIdoJoinStateType("error");
                            setIdoJoinStateText("Finished");
                        }
                    }
                }
                else { //'null'이면서 컨트랙트가 추첨완료 상태면 당첨실패.
                    const drawFinished = await checkDrawFinished(idoContract.applyWhitelistContract);
                    if (drawFinished) {
                        setWhiteListStateType("info");
                        setWhiteListStateText(tIdoMessage.whitelistFail);//"you failed on WhiteList drawing lots.");

                        setKycStateText("");
                    }
                }
            }
        }
    }

    const onWhiteListApply = async () => {
        // irc 지갑 주소 연동 체크
        if(address) {
            if (ticketBalance == 0) {
                alert('Need IDO Ticket to apply for whitelist.');
                return;
            }

            // 티켓 보유량이 있을경우 신청할수 있음
            if(ticketBalance > 0){

                const minTicketCnt = idoContract.minIdoTicket;
                const maxTicketCnt = idoContract.maxIdoTicket;
                if(!(ticketBalance >= minTicketCnt && ticketBalance <= maxTicketCnt)){
                    alert(`IDO ticket must be beetween ${minTicketCnt} ~ ${maxTicketCnt}`);
                    return false;
                }

                const {result, isSuccess}= await applyWhitelist(idoContract.applyWhitelistContract);
                if (!isSuccess) {
                    let errorMessage = t(lang.failedToSend);
                    if (typeof result === 'string') {
                        if (result.indexOf('{') > -1) {
                            const error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                            if (error.code === 2) {
                                let vFailedToSend = t(lang.failedToSend);
                                if(error.message){
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
                            //20210621 추가.iwallet에러메시지 파싱. (Error: ~ \n 까지 파싱)
                            if (result.message && result.message.indexOf('Error:') > 0) {
                                let errMsgEnd = result.message.indexOf('\n', result.message.indexOf('Error:'));
                                errorMessage = result.message.substring(result.message.indexOf('Error:')+6, errMsgEnd);
                            }else {
                                errorMessage = `${tMessage.failedToSend}`;
                            }
                        } else{
                            errorMessage = `${tMessage.jetstreamFail}`;
                        }
                    }
                    alert(errorMessage);
                    return
                }
                if(isSuccess){
                    window.$message.success(`${t(lang.whiteListApplyRequestMsg)}`);
                    getSearch();
                }
            }
        }
    }

    const onKycReg = () => {
        setKycIdoIdSelected(idoID);
        setKycModalOpen(true);
    }
    const onKycClose = (success) => {
        setKycModalOpen(false);
        if(success){
            getSearch();
        }
    }

    const onSwapClick = async () => {
        setSwapModal(true);
    }
    const onSwapClose = (isSearch) => {
        setSwapModal(false);
        if(isSearch){
            getSearch();
        }
    }

    const onClaimClick = async() => {

        // if(!window.confirm('Do you want to claim ' + ComUtil.idoTokenName(idoContract.tokenName) + '?')) {
        //     return;
        // }

        //setBuyIdoLoading(true);
        const {result, isSuccess} = await idoApi.claimToken(idoContract.buyIdoContract);

        if (isSuccess) {
            //setBuyIdoLoading(false);
            window.$message.success('Success');
            //onSwapClose();
            getSearch();
        }else{
            //setBuyIdoLoading(false);
            window.$message.error('failed');
            let errorMessage = "";
            if (typeof result === 'string') {
                if (result.indexOf('{') > -1) {
                    const error = JSON.parse(result.substring(result.indexOf('{'), result.indexOf('}') + 1))
                    if (error.code === 2) {
                        let vFailedToSend = tMessage.failedToSend;
                        if(error.message){
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
                    //20210621 추가.iwallet에러메시지 파싱. (Error: ~ \n 까지 파싱)
                    if (result.message && result.message.indexOf('Error:') > 0) {
                        let errMsgEnd = result.message.indexOf('\n', result.message.indexOf('Error:'));
                        errorMessage = result.message.substring(result.message.indexOf('Error:')+6, errMsgEnd);
                    }else {
                        errorMessage = `${tMessage.failedToSend}`;
                    }
                } else{
                    errorMessage = `${tMessage.jetstreamFail}`;
                }
            }
            if(errorMessage) {
                alert(errorMessage);
            }
        }
    }

    // xx/total (xx%) 출력 - boughtIdoToken값이 없으면 'loading..'표시'
    const calcPercent = (boughtIdoToken, totalIdoToken) =>  {
        if (boughtIdoToken) {
            return boughtIdoToken + '/' + totalIdoToken; // ' (' + (boughtIdoToken*100/totalIdoToken).toFixed(0) + '%)';
        }
        return 'loading..'; //값이 없을때는 loading표시
    }
    //
    // const getActiveIndex = useCallback(() => {
    //     //IDO 참여
    //     if (idoJoinDurationStatus.rangeState === 1) {
    //         return 4
    //     }
    //     //kyc 인증
    //     else if (kycDurationStatus.rangeState === 1){
    //         return 3
    //     }
    //     //화이트리스트 참여
    //     else if (applyWhiteListDurationStatus.rangeState === 1){
    //         return 2
    //     }
    //     //사용자 정보등록
    //     else if (applyWhiteListDurationStatus.rangeState !== 2){
    //         return 1;
    //     }
    //     //티켓구입
    //     else if(applyWhiteListDurationStatus.rangeState !== 2){
    //         return 0
    //     }
    // }, [idoJoinDurationStatus.rangeState, kycDurationStatus.rangeState, applyWhiteListDurationStatus.rangeState])

    return (
        <Div>
            <PageHeading
                title={<Div><Span fg={'white'}>IO</Span><Span fg={'donnie'}>STarter</Span> Detail</Div>}
                description={tMemuIdo.desc}
            />

            <Flex justifyContent={'center'} pb={80}>
                <Div width={sizeValue(436, null, '95%')} minHeight={721}>
                    {
                        idoContract ?
                            <Div minHeight={400} >
                                <Div>
                                    <Div px={16} pt={20} pb={28} bg={'light'} custom={`border-radius: ${getValue(10)} ${getValue(10)} 0 0;`}>


                                        {/* coming soon, running ... */}
                                        <Flex mb={5} justifyContent={'flex-end'}>
                                            {
                                                (idoStatus === null || idoStatus === undefined) ? null : (
                                                    <>
                                                        {
                                                            idoStatus.state === 2 ? <Badge color={'#000000'} />:<Badge status={idoStatus.state === 1 ? "processing":'error'}/>
                                                        }
                                                        {
                                                            [0].includes(idoStatus.state) && (
                                                                <>
                                                                    <Div>Coming soon</Div>
                                                                    <Div ml={5}>[{idoStatus.text}]</Div>
                                                                </>
                                                            )
                                                        }
                                                        {
                                                            [1].includes(idoStatus.state) && (
                                                                <>
                                                                    <Div>Running</Div>
                                                                    <Div ml={5}>[{idoStatus.text}]</Div>
                                                                </>
                                                            )
                                                        }
                                                        {
                                                            [2].includes(idoStatus.state) && (
                                                                <>
                                                                    <Div>Finished</Div>
                                                                </>
                                                            )
                                                        }
                                                    </>
                                                )
                                            }
                                        </Flex>

                                        {/* token image, name ... */}
                                        <Flex alignItems={'flex-start'}>
                                            <Div>
                                                <img src={idoContract.img} width={35}/>
                                            </Div>
                                            <Div ml={20}>
                                                <Div fontSize={18} bold><b>{idoContract.idoName}</b></Div>
                                                <Div fg={'darkMid'}>
                                                    <Flex>
                                                        <Span mr={10}>TokenName : <Tooltip title={`id:${idoID}`}>{ComUtil.idoTokenName(idoContract.tokenName)}</Tooltip></Span>
                                                    </Flex>
                                                </Div>
                                            </Div>
                                        </Flex>
                                    </Div>
                                    <Div bg={'white'} custom={`border-radius: 0 0 ${getValue(10)} ${getValue(10)};`}>
                                        {/* progress */}
                                        <Flex pt={50} pb={50} px={30} justifyContent={'center'}>
                                            <Div width={'90%'} height={1} bg={'donnie'} relative fontSize={11}>
                                                <ProcessLineMobile />
                                            </Div>
                                        </Flex>
                                        <Hr/>
                                        {
                                            address &&
                                            <Div px={24} py={10} fontSize={15} textAlign={'center'}>
                                                <Alert message={<Span>Your Total IDO Ticket: <b>{`${ticketBalance}`}</b></Span>} type="info"/>
                                            </Div>
                                        }
                                        {
                                            (!address && idoStatus.state === 1) &&
                                            <Div px={24} py={10} fontSize={15} textAlign={'center'}>
                                                Please connect wallet to join.
                                            </Div>
                                        }
                                        <Div >
                                            <Div p={16} py={20}>
                                                <Div fontSize={15} bold>
                                                    <b>IDO Information</b>
                                                </Div>

                                                <Flex>
                                                    <Div minWidth={110}>Whitelist Winners</Div>
                                                    <Right><b>{idoContract.maxWhitelist} account</b></Right>
                                                </Flex>
                                                <Flex>
                                                    <Div minWidth={110}>IDO Ticket to Participate</Div>
                                                    <Right><b>{idoContract.minIdoTicket} ~ {idoContract.maxIdoTicket} tickets</b></Right>
                                                </Flex>

                                                <Div mt={16}>
                                                    {
                                                        (idoStatus.state > 0) &&
                                                        <Flex mb={5}>
                                                            {
                                                                applyWhiteListDurationStatus.rangeState === 2 ? <Badge color={'#000000'} />:<Badge status={applyWhiteListDurationStatus.rangeState === 1 ? "processing":'error'}/>
                                                            }
                                                            <Span>
                                                                {applyWhiteListDurationStatus.rangeState === 0 && 'Opening'}{applyWhiteListDurationStatus.rangeState === 1 && 'Running'}
                                                                {
                                                                    applyWhiteListDurationStatus.rangeState > 0 && applyWhiteListDurationStatus.text &&
                                                                    (applyWhiteListDurationStatus.rangeState === 2 ? applyWhiteListDurationStatus.text:` [${applyWhiteListDurationStatus.text}]`)
                                                                }
                                                            </Span>
                                                        </Flex>
                                                    }
                                                    <Skeleton loading={skeletonLoading} active paragraph={{ rows: 2 }}>
                                                        <Alert
                                                            showIcon
                                                            type={address ? whiteListStateType:'error'}
                                                            message="Whitelist Draw"
                                                            description={address ? whiteListStateText:''}
                                                            action={
                                                                address ?
                                                                    <Space direction="vertical">
                                                                        <Button
                                                                            style={{minWidth: 90}}
                                                                            size="small"
                                                                            type="primary"
                                                                            disabled={actionWhiteListDisabledState}
                                                                            onClick={onWhiteListApply}
                                                                        >
                                                                            Apply
                                                                        </Button>
                                                                    </Space>
                                                                    :
                                                                    null
                                                            }
                                                        />
                                                    </Skeleton>
                                                </Div>
                                            </Div>
                                            <Hr />

                                            <Div p={16} py={20}>
                                                <Div>
                                                    {
                                                        (idoStatus.state > 0) &&
                                                        <Flex mb={5}>
                                                            {
                                                                kycDurationStatus.rangeState === 2 ? <Badge color={'#000000'} />:<Badge status={kycDurationStatus.rangeState === 1 ? "processing":'error'}/>
                                                            }
                                                            <Span>
                                                                {kycDurationStatus.rangeState === 0 && 'Opening'}{kycDurationStatus.rangeState === 1 && 'Running'} {
                                                                kycDurationStatus.rangeState >= 0 && kycDurationStatus.text &&
                                                                (kycDurationStatus.rangeState === 2 ? kycDurationStatus.text:`[${kycDurationStatus.text}]`)
                                                            }
                                                            </Span>
                                                            <Div ml={3}>
                                                                <Tooltip title={`Countries not supported: Afghanistan, Albania, Belarus, Bosnia and Herzegovina, Burundi, Burma, Canada, China, Korea (Democratic People\'s Republic of), Democratic Republic of Congo, Cuba, Ethiopia, Guinea-Bissau, Guinea, Iran, Iraq, Japan, Liberia, Lebanon, Libya, Macedonia, Malaysia, New Zealand, Serbia, Sri Lanka, Sudan, Somalia, Syria, Thailand, Trinidad and Tobago, Tunisia, Uganda, Ukraine, United States of America, Venezuela, Yemen, Zimbabwe.\n` +
                                                                `For users from other countries, please check and make sure your participation in the token sale on Startup complies with local laws and regulations.`} placement="topLeft"><BsQuestionCircle /></Tooltip>
                                                            </Div>
                                                        </Flex>
                                                    }
                                                    <Skeleton loading={skeletonLoading} active paragraph={{ rows: 2 }}>
                                                        <Alert
                                                            showIcon
                                                            type={address ? kycStateType:'error'}
                                                            message="KYC with passport"
                                                            description={address ? kycStateText:''}
                                                            action={
                                                                address ?
                                                                    <Space direction="vertical">
                                                                        <Button style={{minWidth: 90}} size="small" type="primary"
                                                                                disabled={actionKYCDisabledState}
                                                                                onClick={onKycReg}
                                                                        >
                                                                            KYC
                                                                        </Button>
                                                                    </Space>
                                                                    :
                                                                    null
                                                            }
                                                        />
                                                    </Skeleton>
                                                </Div>
                                            </Div>
                                            <Hr />
                                            <Div p={16} py={20}>
                                                <Div>
                                                    {
                                                        idoContract.buyIdoContract &&
                                                        <Div>
                                                            <Span>IDO Contract</Span>
                                                            <Div fontSize={11}>{idoContract.buyIdoContract}</Div>
                                                        </Div>
                                                    }



                                                    <Flex flexWrap={'wrap'} alignItems={'flex-start'} mt={10}>
                                                        <Div>Total Raise</Div>
                                                        <Right textAlign={'right'}>
                                                            <Div><b>{ComUtil.addCommas(idoContract.totalIdoToken * idoContract.idoPrice)} {idoContract.payingToken}</b></Div>
                                                            {/*<Div>(1 {ComUtil.idoTokenName(idoContract.tokenName)} = {idoContract.idoPrice} {idoContract.payingToken}) </Div>*/}
                                                        </Right>
                                                    </Flex>

                                                    <Flex mt={1}>
                                                        <Div>Price</Div>
                                                        <Right><b>1 {ComUtil.idoTokenName(idoContract.tokenName)} = {idoContract.idoPrice} {idoContract.payingToken}</b></Right>
                                                    </Flex>

                                                    <Flex mt={1} mb={20}>
                                                        <Div>Min/Max Purchase per Winner</Div>
                                                        <Right><b>{idoContract.minPay} ~ {idoContract.maxPay} {idoContract.payingToken}</b></Right>
                                                    </Flex>

                                                    {/*Total Raise: <Span bold>{ComUtil.addCommas(idoContract.totalIdoToken * idoContract.idoPrice)} {idoContract.payingToken} </Span> <br/>*/}
                                                    {/*<Div ml={70} fontSize={13}>(1 {ComUtil.idoTokenName(idoContract.tokenName)} = {idoContract.idoPrice} {idoContract.payingToken}) </Div>*/}
                                                    {/*Allocation: <Span bold>{idoContract.minPay} ~ {idoContract.maxPay} {idoContract.payingToken} </Span><br/>*/}

                                                    {
                                                        (idoStatus.state > 0) &&
                                                        <Flex mb={5}>
                                                            {
                                                                idoJoinDurationStatus.rangeState === 2 && <Badge color={'#000000'} />
                                                            }
                                                            {
                                                                idoJoinDurationStatus.rangeState !== 2 && <Badge status={idoJoinDurationStatus.rangeState === 1 ? "processing":'error'}/>
                                                            }
                                                            <Span>
                                                                {idoJoinDurationStatus.rangeState === 0 && 'Opening'}{idoJoinDurationStatus.rangeState === 1 && 'Running'} {
                                                                idoJoinDurationStatus.rangeState >= 0 && idoJoinDurationStatus.text &&
                                                                (idoJoinDurationStatus.rangeState === 2 ? idoJoinDurationStatus.text:`[${idoJoinDurationStatus.text}]`)
                                                            }
                                                            </Span>
                                                        </Flex>
                                                    }
                                                    <Skeleton loading={skeletonLoading} active paragraph={{ rows: 2 }}>
                                                        <Alert
                                                            showIcon
                                                            type={address ? idoJoinStateType:'error'}
                                                            message="Join IDO"
                                                            description={address ? idoJoinStateText:''}
                                                            action={
                                                                address ?
                                                                    <Space direction="vertical">
                                                                        <Button style={{minWidth: 90}} size="small" type="primary" disabled={actionIdoJoinDisabledState} onClick={onSwapClick}>Join IDO</Button>
                                                                        <Button style={{minWidth: 90}} size="small" type="primary" disabled={actionClaimDisabledState} onClick={onClaimClick}>Claim Token</Button>
                                                                    </Space>
                                                                    :
                                                                    null
                                                            }
                                                        />
                                                    </Skeleton>
                                                    {(idoStatus.state == 2) &&
                                                        <Div fontSize={12} mt={10} >
                                                            {ComUtil.idoTokenName(idoContract.tokenName)} exchange :
                                                            <Link to={'/exchange/swap'} >
                                                                <u>Exchange menu Swap tab</u>
                                                            </Link><br/>
                                                            {ComUtil.idoTokenName(idoContract.tokenName)} transfer :
                                                            <Link to={'/exchange/bridge'} >
                                                                <u>Exchange menu Bridge tab</u>
                                                            </Link>
                                                        </Div>
                                                    }
                                                </Div>
                                                {/*<Div mt={10}>*/}
                                                {/*    <Link to={'/exchange/bridge'} >*/}
                                                {/*        <u>How to swap out?</u>*/}
                                                {/*    </Link>*/}
                                                {/*</Div>*/}
                                            </Div>
                                            <Hr />
                                            <Div p={16}>
                                                <Div>
                                                    {
                                                        (!ComUtil.isStarted(idoContract.buyIdoStart) || isNaN(boughtIdoToken)) ?
                                                            <Progress percent={0}></Progress>
                                                            :
                                                            <Progress
                                                                percent={(boughtIdoToken * 100 / idoContract.totalIdoToken).toFixed(0)}
                                                                success={
                                                                    {
                                                                        'percent':(boughtIdoToken * 100 / idoContract.totalIdoToken).toFixed(0),
                                                                        'strokeColor':((boughtIdoToken * 100 / idoContract.totalIdoToken).toFixed(0)) == 100 ? color.info:color.info
                                                                    }
                                                                }
                                                                showInfo={true} status={'normal'}
                                                            ></Progress>
                                                    }
                                                </Div>

                                                <Div fontSize={12}> IDO Progress :
                                                    {(!ComUtil.isStarted(idoContract.buyIdoStart)) ?  //buyIdo 미시작시에는 0으로 출력.
                                                        <Span> 0/{idoContract.totalIdoToken} {ComUtil.idoTokenName(idoContract.tokenName)} </Span>
                                                        :
                                                        <Span> {calcPercent(boughtIdoToken, idoContract.totalIdoToken)} {ComUtil.idoTokenName(idoContract.tokenName)} </Span>
                                                    }
                                                </Div>
                                            </Div>
                                        </Div>
                                    </Div>



                                </Div>
                            </Div>
                            :
                            null
                    }
                </Div>
            </Flex>

            <Modal
                title={'IDO KYC Apply'}
                visible={kycModalOpen}
                onCancel={()=>setKycModalOpen(false)}
                footer={null}
                centered={true}
                destroyOnClose={true}
                bodyStyle={{padding: 0}}
            >
                <IdoKycApply idoId={kycIdoIdSelected} onClose={onKycClose} />
            </Modal>

            {/* 교환 swap */}
            <Modal
                title={<Flex><Div lineHeight={25} ml={8} mb={-3}>{'Join IDO'}</Div></Flex>}
                visible={swapModal}
                onCancel={() => onSwapClose(false)}
                footer={null}
                width={'auto'}
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}
            >
                <IdoSwap idoContract={idoContract} onClose={onSwapClose} />
            </Modal>

        </Div>
    );
});
export default withTranslation()(withRouter(IdoDetail))