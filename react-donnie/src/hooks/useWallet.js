import React, {useState, useEffect} from 'react'
import {useRecoilState} from "recoil";
import {disConnectSelector, walletLoadingState, myAddressSelector, tokenState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";
import WalletUtil from "~/util/WalletUtil";
import {useTranslation} from "react-i18next";
import tp from "tp-js-sdk";

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
            if (myWallet.walletType == 'IWallet') {
                //Tokenpocket IOST
                if(tp.isConnected()){
                    if (myWallet.wallet.account) {
                        return true
                    }
                }else {
                    if (myWallet.wallet.account && myWallet.wallet.account.name) {
                        return true
                    }
                }
            }
            if (myWallet.walletType == 'Jetstream') {
                if (myWallet.wallet.address) {
                    return true
                }
            }
        }
        return false
    }


    const connectIWallet = async (type) => {

        try{

            await ComUtil.delay(500)

            //Tokenpocket IOST
            if(tp.isConnected()){

                tp.getCurrentWallet().then(({result,data})=>{
                    if(data.blockchain !== "iost"){
                        window.$notify.error(
                            {
                                message: "IOST Wallet required",
                                description: "IOST Wallet required"
                            }
                        );
                    }

                    if(data.blockchain === "iost"){
                        let myWallet = WalletUtil.getMyWallet("IWallet");
                        myWallet.wallet.enable().then((account) => {
                            // 계정값이 널일경우 지갑이 Locked일 가능성이 있음
                            if (!account) {
                                let v_msg = "Wallet Locked";
                                let v_msg_description = t('NeedRefreshIwallet'); //"Refresh Browser! to unlock iWallet chrome-extension";
                                window.$notify.error(
                                    {
                                        message: v_msg,
                                        description: v_msg_description
                                    }
                                );
                                setLoading(false)
                                return
                            }

                            localStorage.setItem("IostWalletGb", "IWallet");
                            setAddress(account)
                            setLoading(false)
                            window.$message.success(t('Connected'))
                            // setAddress('')
                            setLoading(false);

                        }).catch((err) => {
                            if (err.type == "locked") {
                                let v_msg = "Wallet Locked";
                                let v_msg_description = t('NeedRefreshIwallet');
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
                    }
                })

            }else {

                const myWallet = WalletUtil.getMyWallet(type);
                if (!hasIWallet(type)) {
                    let vMsgDec = t('PleaseInstall');
                    let v_Msg = "iWallet chrome-extension Install";
                    if (myWallet.walletType == 'Jetstream') {
                        v_Msg = "Jetstream chrome-extension Install";
                    }
                    if(ComUtil.isMobileDevices()){
                        v_Msg = "TokenPocket Install";
                        vMsgDec = "TokenPocket Mobile Install";
                    }
                    window.$notify.error(
                        {
                            message: v_Msg,
                            description: vMsgDec
                        }
                    );
                    // setAddress('')
                    setLoading(false)
                    return
                }

                if (!isLogin(type)) {
                    myWallet.wallet.enable().then((account) => {
                        // 계정값이 널일경우 지갑이 Locked일 가능성이 있음
                        if (account == null) {
                            let v_msg = "Wallet Locked";
                            let v_msg_description = t('NeedRefreshIwallet'); //"Refresh Browser! to unlock iWallet chrome-extension";
                            if (myWallet.walletType == 'Jetstream') {
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
                            if (myWallet.walletType == 'Jetstream') {
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
                            if (myWallet.walletType == 'Jetstream') {
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
                        if (myWallet.walletType == 'Jetstream') {
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
            }

        }catch (err) {
            console.error(err.message)
            const myWallet = WalletUtil.getMyWallet(type);
            if (!myWallet.wallet) {
                let vMsgDec = t('PleaseInstall');
                let v_Msg = "iWallet chrome-extension Install";
                if (myWallet.walletType == 'Jetstream') {
                    v_Msg = "Jetstream chrome-extension Install";
                }
                if(ComUtil.isMobileDevices()){
                    v_Msg = "TokenPocket Install";
                    vMsgDec = "TokenPocket Mobile Install";
                }
                window.$notify.error(
                    {
                        message: v_Msg,
                        description: vMsgDec
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
