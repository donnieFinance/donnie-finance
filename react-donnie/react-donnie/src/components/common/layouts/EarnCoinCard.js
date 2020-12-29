import React from 'react';
import {Div, Flex, Img, XCenter} from "~/styledComponents/shared";
import TimeCountDown from "~/components/common/layouts/TimeCountDown";
import useSize from "~/hooks/useSize";
import {useRecoilState} from "recoil";
import {checkingStakeSelector, disConnectSelector} from "~/hooks/atomState";
import {useTranslation} from "react-i18next";

const EarnCoinCard = ({
                          coinIcon,
                          coinName,
                          onTokenScan,
                          contractAddress,
                          leftTime
                      }) => {

    const {size, sizeValue} = useSize()
    const [stake,] = useRecoilState(checkingStakeSelector);
    const [disConnect,] = useRecoilState(disConnectSelector);
    const {t} = useTranslation()

    return (
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
                            <Div fontSize={sizeValue(44, null, 35)} fw={600} mt={8}>{coinName}</Div>
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
                <Div fontSize={13} cursor onClick={onTokenScan} fg={'info'}><u>{window.$tokenName+' TokenID : '} '{contractAddress}'</u></Div>
                <TimeCountDown leftTime={leftTime} />
                <Div fontSize={16}>
                    {
                        (stake.status === 0 && !stake.startInWeek) ?  t('comingSoon') : null
                    }
                    {
                        //dony : 1주내 오픈으로 사용
                        (stake.status === 0 && stake.startInWeek) ? t('countdown2') : null
                    }
                    {
                        stake.status === 1 ? t('countdown1') : null
                    }
                </Div>
                {
                    // 지갑 연결 유무에 따른 알림
                    disConnect ? <Div><p>{t('PleaseInstall')}</p></Div>: null
                }
            </Flex>
        </Flex>
    );
};

export default EarnCoinCard;
