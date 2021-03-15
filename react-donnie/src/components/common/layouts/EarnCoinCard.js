import React from 'react';
import {Div, Flex, Img, XCenter} from "~/styledComponents/shared";
import TimeCountDown from "~/components/common/layouts/TimeCountDown";
import useSize from "~/hooks/useSize";
import {useRecoilState} from "recoil";
import {
    //checkingStakeSelector,
    disConnectSelector} from "~/hooks/atomState";
import {useTranslation} from "react-i18next";
import useRunningStatus from "~/hooks/useRunningStatus";
import ComUtil from "~/util/ComUtil";

const EarnCoinCard = ({
                          coinIcon,
                          coinName,
                          onTokenScan,
                          contractAddress,
                          status,
                          duration,
                          startInWeek,
                          // leftTime
                      }) => {

    const {size, sizeValue} = useSize()
    // const [stake,] = useRecoilState(checkingStakeSelector);
    const [disConnect,] = useRecoilState(disConnectSelector);
    const {t} = useTranslation()

    //running 전에만 노출
    if (status === -1 || status === 0){
        return(
            <Flex justifyContent={'center'}>
                <Flex
                    flexDirection={'column'} justifyContent={'center'} bg={'white'} rounded={3}
                    width={sizeValue(450, null, '90%')}
                    minHeight={247+35}
                    shadow={'lg'}
                    py={30}
                >
                    {/*<Div fontSize={38} fw={500} my={10}>Checking & Saving</Div>*/}
                    {
                        coinName && (
                            <Flex mb={sizeValue(20, null, 15)} >
                                <Img src={coinIcon} alt={''} width={sizeValue(61, null, 50)} />
                                <Div fontSize={sizeValue(44, null, 35)} fw={600} ml={10} mt={8}>{coinName}</Div>
                            </Flex>
                        )
                    }

                    <Div
                        bold
                        fontSize={sizeValue(18, 16)}
                        px={sizeValue(50, 20)}
                        textAlign={'center'}
                        mb={5}
                        mt={10}
                    >
                        {t('EarnDonnie')}
                    </Div>
                    <Div fontSize={13} cursor={1} onClick={onTokenScan} fg={'info'}><u>{window.$tokenName+' TokenID : '} '{contractAddress}'</u></Div>
                    {
                        status === 0 && <TimeCountDown leftTime={duration} />
                    }
                    {
                        //preparing
                        [-1].includes(status) ?  <Div fontSize={20} lighter mt={10}>{t('comingSoon')}</Div> : null
                    }
                    {
                        //coming soon
                        [0].includes(status) ? <Div fontSize={16}>{t('countdown2')}</Div> : null
                    }
                    {/*{*/}
                    {/*    //running*/}
                    {/*    [1].includes(status) ? <Div fontSize={16}>{t('countdown1')}</Div> : null*/}
                    {/*}*/}
                    {/*{  //서비스 종료추가 20200107*/}
                    {/*    status === 2 ? t('countdownEnd') : null*/}
                    {/*}*/}
                    {/*{*/}
                    {/*    status === 2 ? <Div fontSize={16}>{t('StagePhase')} </Div> : null*/}
                    {/*}*/}
                    {
                        // 지갑 연결 유무에 따른 알림
                        disConnect ? <Div><p>{t('PleaseInstall')}</p></Div>: null
                    }
                </Flex>
            </Flex>
        )
    }

    return null
};

export default EarnCoinCard;
