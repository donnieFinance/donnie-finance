import React, {useEffect, useState} from 'react';
import {Button, Div, Flex, GridColumns, Hr, Img, Right, RoundedCard, SymbolIcon} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";
import aniKey from "~/styledComponents/Keyframes";
import {Badge, Progress} from 'antd';
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";
import useInterval from "~/hooks/useInterval";
import idoApi from "~/lib/idoApi";
import useWallet from "~/hooks/useWallet";
import WalletUtil from "~/util/WalletUtil";
import {CgUserList, CgPlayListCheck} from 'react-icons/cg'
import {color} from "~/styledComponents/Properties";
import {RiCoupon3Line} from 'react-icons/ri'
import useSize from "~/hooks/useSize";

const Content = styled(Flex)`
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
    justify-content: center;
`;
const Info = styled(Flex)`    
    opacity: 0;
    animation: 0.2s ${aniKey.fadeIn} ease-in forwards;
`;

const Secondary = styled(Flex)`
    color: #696C6E;
`

const IdoCard = ({
                     idoKey,
                     idoObject //properties의 idoList.dogi1 통째로 넘김.
                 }) => {

    const {sizeValue} = useSize()

    const {myWalletType,} = useState(WalletUtil.getMyWallet().walletType);
    const {isLogin, address} = useWallet()
    const {t} = useTranslation()
    const history = useHistory()

    // 0:open전, 1:running, 2:finished
    const [status,setStatus] = useState(ComUtil.getIdoStatus(idoObject.applyWhitelistStart, idoObject.buyIdoEnd))

    //componentDidUpdate
    useEffect(() => {
        getIdoStatusSearch();
    }, [address, myWalletType])

    //60초에 한번씩 IdoStatus 업데이트
    useInterval(() => {
        getIdoStatusSearch();
    }, 1000 * 60)
    // 각 항목별 시간 갱신 및 상태값 세팅
    const getIdoStatusSearch = async () => {
        if(idoObject) {

            // idoStatus 전체 상태값
            const resStatus = ComUtil.getIdoStatus(idoObject.applyWhitelistStart, idoObject.buyIdoEnd)
            setStatus(resStatus);

            //하단 idoCard용: idoObject에 buy완료된 idoToken개수 추가하기: progress바 용도
            if (idoObject.buyIdoContract) {

                const totalIdoLeft = await idoApi.getTotalIdoLeft(idoObject.buyIdoContract)
                const boughtIdoToken = idoObject.totalIdoToken - totalIdoLeft;
                idoObject.boughtIdoToken = boughtIdoToken.toFixed(0); //boughtIdoToken을 필드로 추가.(정수로 추가)
                //console.log(idoKey, boughtIdoToken);

                //applyWhitelist 신청여부 조회.
                if(isLogin() && idoObject.applyWhitelistContract) {
                    const userApplyTicket = await idoApi.getUserOriginTicket(idoObject.applyWhitelistContract, address)
                    //console.log('userApplyTicket', userApplyTicket);
                    idoObject.myApply = (userApplyTicket)? true:false;
                }
            }
        }
    }

    const onMoveDetailClick = () => {
        history.push("/iostarter/"+idoKey)
    }

    const Symbol = () => {
        return <Img src={idoObject.img} width={40} height={40} alt={ComUtil.coinName(idoObject.tokenName)}/>
    }

    // xx/total (xx%) 출력 - boughtIdoToken값이 없으면 'loading..'표시'
    const calcPercent = (boughtIdoToken, totalIdoToken) =>  {
        if (boughtIdoToken) {
            return boughtIdoToken + ' / ' + totalIdoToken ; //+ ' (' + (boughtIdoToken*100/totalIdoToken).toFixed(0) + '%)';
        }
        return 'loading..'; //값이 없을때는 loading표시
    }



    return (


        <RoundedCard relative
                     // shadow={'lg'}
                     minWidth={sizeValue(400, 350,  '95%')}>

            <Div bg={[2].includes(status)?'lightgray':'light'} p={10}>

                {/*timer card*/}
                <Div minHeight={21}>
                    <Flex absolute top={'3%'} right={12} fg={'dark'} px={10}>
                        {
                            (status === null || status === undefined) ? null : (
                                <>
                                    {
                                        status === 2 ?
                                            <Badge color={'#000000'} text={'Finished'}/>
                                            :
                                            <Badge
                                                status={status === 1 ? "processing":'error'}
                                                text={
                                                    status === 1 ?
                                                        'Running'
                                                        :
                                                        ComUtil.getIdoCommingSoonText(idoObject.applyWhitelistStart)
                                                }
                                            />
                                    }
                                </>
                            )
                        }
                    </Flex>
                </Div>

                {/* iCON & total Raise */}
                <Flex flexDirection={'column'} justifyContent={'center'} height={120}>
                    <GridColumns repeat={2} colGap={1} rowGap={3}>
                        <Symbol />
                        <Div fontSize={20} mt={5} bold>{idoObject.idoName}</Div>
                        <Div> Funds to Raise</Div>
                        <Div fontSize={15} > {ComUtil.addCommas(idoObject.totalIdoToken * idoObject.idoPrice)}  {idoObject.payingToken}</Div>
                        <Div> Price</Div>
                        <Div fontSize={15} > 1 {ComUtil.idoTokenName(idoObject.tokenName)} = {idoObject.idoPrice} {idoObject.payingToken} (≈1.5 USD)</Div>
                    </GridColumns>
                </Flex>

            </Div>

            {/* line 의 색상과 겹쳐서 항상 white 로.. */}
            <Div bg={[2].includes(status)?'white':'white'} bc={'light'}>
                <Div p={16} minHeight={100} flexDirection={'column'}>

                    {/* 정보*/}
                    <GridColumns repeat={2} colGap={1} rowGap={5}>

                        {/* whitelist*/}
                        <Div fontSize={17} bold> Whitelist Draw</Div>
                        <Div fontSize={12} fg={'secondary'}>{ComUtil.utc0DateFormat(idoObject.applyWhitelistStart)} (UTC+0)</Div>

                        <Secondary>
                            <CgUserList size={20} />
                            <Div ml={5}>Whitelist Winners</Div>
                        </Secondary>
                        <Secondary fontSize={15}>{idoObject.maxWhitelist} account</Secondary>

                        <Secondary>
                            <Div lineHeight={0}><RiCoupon3Line size={20}/></Div>
                            <Div ml={5}>IDO Ticket to Participate</Div>
                        </Secondary>
                        <Div fg={'info'} fontSize={15} bold> {idoObject.minIdoTicket} ~ {idoObject.maxIdoTicket} IDO Ticket </Div>



                    </GridColumns>
                    <Hr  my={16}/>
                    <GridColumns repeat={2} colGap={1} rowGap={5}>
                        {/* ido*/}
                        <Div fontSize={17} bold mt={10}> IDO </Div>
                        <Div fontSize={12} mt={10} fg={'secondary'}>{ComUtil.utc0DateFormat(idoObject.buyIdoStart)} (UTC+0)</Div>

                        <Secondary> · Min/Max Purchase per Winner</Secondary>
                        <Div fg={'info'} fontSize={15} bold> {idoObject.minPay} ~ {idoObject.maxPay} {idoObject.payingToken} </Div>

                        <Secondary> · Progress</Secondary>
                        {(!ComUtil.isStarted(idoObject.buyIdoStart)) ?  //buyIdo 미시작시에는 0으로 출력.
                            <Secondary> 0 / {idoObject.totalIdoToken} {ComUtil.idoTokenName(idoObject.tokenName)} </Secondary>
                            :
                            <Secondary> {calcPercent(idoObject.boughtIdoToken, idoObject.totalIdoToken)} {ComUtil.idoTokenName(idoObject.tokenName)}</Secondary>
                        }
                    </GridColumns>



                    <Div my={10}>
                        {
                            (!ComUtil.isStarted(idoObject.buyIdoStart) || isNaN(idoObject.boughtIdoToken)) ?
                                <Progress percent={0} size="small" />
                                :
                                <Progress
                                    percent={(idoObject.boughtIdoToken * 100 / idoObject.totalIdoToken).toFixed(0)}
                                    size="small"
                                    success={
                                        {
                                            'percent':(idoObject.boughtIdoToken * 100 / idoObject.totalIdoToken).toFixed(0),
                                            'strokeColor':((idoObject.boughtIdoToken * 100 / idoObject.totalIdoToken).toFixed(0)) == 100 ? color.info:color.info
                                        }
                                    }
                                    showInfo={true} status={'active'}/>
                        }
                    </Div>

                    <Div height={10}> </Div>

                    {/* 버튼*/}
                    <Div mt={'auto'}>
                        <Content>
                            <Button
                                block
                                bg={
                                    address && idoObject.myApply ? 'donnie' : 'primary'
                                }
                                fg={'white'}
                                onClick={onMoveDetailClick}
                                px={10}>
                                {t('idoDetail')}
                            </Button>
                        </Content>
                    </Div>

                </Div>

            </Div>
        </RoundedCard>


    )
};
export default IdoCard;