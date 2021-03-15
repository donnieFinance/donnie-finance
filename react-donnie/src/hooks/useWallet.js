import React, {useState, useEffect} from 'react'
import {useRecoilState} from "recoil";
import {disConnectSelector, walletLoadingState, myAddressSelector, tokenState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";
import WalletUtil from "~/util/WalletUtil";
import {useTranslation} from "react-i18next";
import IOST from 'iost'

// const getWallet = (type) => {
//     return WalletUtil.getMyWallet(type);
// }
const useWallet = (props) => {
    const [, setLoading] = useRecoilState(walletLoadingState)
    const [address, setAddress] = useRecoilState(myAddressSelector)
    const [token, setToken] = useRecoilState(tokenState)
    const { t, i18n } = useTranslation();

    const hasIWallet = (type) => {
        const myWallet = WalletUtil.getMyWallet(type);
        //console.log("hasIWallet===",myWallet)
        if(!myWallet.wallet){
            return false
        }
        return true
    }

    const isLogin = (type) => {
        if (hasIWallet(type)) {
            const myWallet = WalletUtil.getMyWallet(type);
            //console.log("myWallet===",myWallet)
            if(myWallet.walletType == 'IWallet'){
                if(myWallet.wallet.account && myWallet.wallet.account.name){
                    return true
                }
            }
            if(myWallet.walletType == 'Jetstream'){
                if(myWallet.wallet.address){
                    return true
                }
            }
        }
        return false
    }


    const connectIWallet = async (type) => {

        try{

            await ComUtil.delay(500)

            const myWallet = WalletUtil.getMyWallet(type);
            if (!hasIWallet(type)) {
                let v_Msg = "iWallet chrome-extension Install";
                if(myWallet.walletType == 'Jetstream') {
                    v_Msg = "Jetstream chrome-extension Install";
                }
                window.$notify.error(
                    {
                        message: v_Msg,
                        description: t('PleaseInstall')
                    }
                );
                // setAddress('')
                setLoading(false)
                return
            }

            if (!isLogin(type)) {
                myWallet.wallet.enable().then((account) => {
                    // 계정값이 널일경우 지갑이 Locked일 가능성이 있음
                    if(account == null){
                        let v_msg = "Wallet Locked";
                        let v_msg_description = t('NeedRefreshIwallet'); //"Refresh Browser! to unlock iWallet chrome-extension";
                        if(myWallet.walletType == 'Jetstream') {
                            v_msg = "Jetstream Locked";
                            v_msg_description = t('NeedRefreshJetstream');
                        }
                        window.$notify.error(
                            {
                                message: v_msg,
                                description: v_msg_description
                            }
                        );
                    }
                }).catch((err) => {
                    // IWallet 지갑잠금 이었을 경우 기존 컨넥트하였을경우 정보를 인식 못하는 버그로 인해 알림 메시지로 안내
                    // 새로고침 reload 를 해야 IWallet 정보를 인식함
                    if (err.type == "locked") {
                        let v_msg = "Wallet Locked";
                        let v_msg_description = t('NeedRefreshIwallet');
                        if(myWallet.walletType == 'Jetstream') {
                            v_msg = "Jetstream Locked";
                            v_msg_description = t('NeedRefreshJetstream');
                        }
                        window.$notify.error(
                            {
                                message: v_msg,
                                description: v_msg_description
                            }
                        );
                    } else {
                        let v_msg = "iWallet chrome-extension NotConnected";
                        if(myWallet.walletType == 'Jetstream') {
                            v_msg = "Jetstream chrome-extension NotConnected";
                        }
                        window.$notify.error(
                            {
                                message: v_msg,
                                description: t('PleaseConnect')
                            }
                        );
                    }
                })

                // setAddress('')
                setLoading(false)
                return;
            }

            myWallet.wallet.enable().then((account) => {
                if (account) {
                    myWallet.wallet.newIOST(window.IOST);
                    localStorage.setItem("IostWalletGb", type);
                    setAddress(account)
                    setLoading(false)
                    window.$message.success(t('Connected'))
                } else {
                    // setAddress('')
                    setLoading(false)
                }
            }).catch((err) => {
                if (err.type == "locked") {
                    let v_msg = "Wallet Locked";
                    let v_msg_description = t('NeedRefreshIwallet');
                    if(myWallet.walletType == 'Jetstream') {
                        v_msg = "Jetstream Locked";
                        v_msg_description = t('NeedRefreshJetstream');
                    }
                    window.$notify.error(
                        {
                            message: v_msg,
                            description: v_msg_description
                        }
                    );
                }
                // setAddress('')
                setLoading(false)
            })

        }catch (err) {
            console.error(err.message)
            const myWallet = WalletUtil.getMyWallet(type);
            if (!myWallet.wallet) {
                let v_Msg = "iWallet chrome-extension Install";
                if(myWallet.walletType == 'Jetstream') {
                    v_Msg = "Jetstream chrome-extension Install";
                }
                window.$notify.error(
                    {
                        message: v_Msg,
                        description: t('PleaseInstall')
                    }
                );
            }
            // setAddress('')
            setLoading(false)
        }
    }

    const disconnectIWallet = async () => {

        if (hasIWallet()) {
            const myWallet = WalletUtil.getMyWallet();

            let newToken = {}

            // token 별 balance 초기화
            Object.keys(token).map(key => {
                newToken[key] = {
                    tokenName: key,
                    balance: 0
                }
            })
            let v_MSG = "iWallet chrome-extension Disconnected";
            if(myWallet.walletType == 'Jetstream') {
                v_MSG = "Jetstream chrome-extension Disconnected";
            }
            setToken(newToken)
            window.$notify.error(
                {
                    message: v_MSG,
                    description: t('Disconnected')
                }
            );
        }

        setAddress('')

    }

    return {hasIWallet, isLogin, address, connectIWallet, disconnectIWallet}
};

export default useWallet;
