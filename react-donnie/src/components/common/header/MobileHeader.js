import React from 'react';
import {Button, Div, Flex} from "~/styledComponents/shared";
import {AiOutlineMenu} from "react-icons/ai";
import {color} from "~/styledComponents/Properties";
import {useRecoilState} from "recoil";
import SpinnerWrap from '~/components/common/spinnerWrap'

import {
    walletLoadingState,
    connectWalletModalState,
    menuModalState, myAddressSelector
} from '~/hooks/atomState'

import {BsLockFill} from 'react-icons/bs'
import LanguageSelectContent from "~/components/common/header/PopoverSelectLanguage";
import {withTranslation} from "react-i18next";

const MobileHeader = ({t}) => {

    const [loading,] = useRecoilState(walletLoadingState)
    const [address,] = useRecoilState(myAddressSelector)
    const [, setConnectWalletModalOpen] = useRecoilState(connectWalletModalState)
    const [, setMenuOpen] = useRecoilState(menuModalState)

    return (
        <Flex mr={20}>
            <Button fontSize={12} mr={10} bg={'white'} fg={'primary'} px={10} height={30}
                    onClick={() => setConnectWalletModalOpen(true)}
            >
                <SpinnerWrap
                    checkValue={loading}
                    trueValue={address}
                    falseValue={<BsLockFill/>}
                />
            </Button>
            <Button bg={'white'} px={10} height={30}
                    onClick={() => setMenuOpen(true)}>
                <AiOutlineMenu color={color.info} />

            </Button>
            {/*<Div ml={10}>*/}
            {/*    <LanguageSelectContent>*/}
            {/*        <Button fontSize={12} bc={'background'} fg={'background'} px={10} height={30} >{t('lang')}</Button>*/}
            {/*    </LanguageSelectContent>*/}
            {/*</Div>*/}
        </Flex>
    );
};

export default withTranslation()(MobileHeader);
