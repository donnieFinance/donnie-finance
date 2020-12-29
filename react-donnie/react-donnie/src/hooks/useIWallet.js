import React, {useState, useEffect} from 'react'
import {useRecoilState} from "recoil";
import {disConnectSelector, myAddressSelector, tokenState} from "~/hooks/atomState";
import ComUtil from "~/util/ComUtil";
import {useTranslation} from "react-i18next";

import IOST from 'iost'

const useIWallet = (props) => {
    const [address, setAddress] = useRecoilState(myAddressSelector)
    const [token, setToken] = useRecoilState(tokenState)

    const { t, i18n } = useTranslation();


    const hasIWallet = () => {
        if (!window.IWalletJS) {
            return false
        }
        return true
    }

    const isLogin = () => {
        if (hasIWallet() &&
            window.IWalletJS.account &&
            window.IWalletJS.account.name
        ) {
            return true
        }
        return false
    }


    const connectIWallet = async () => {

        try{

            await ComUtil.delay(500)

            if (!hasIWallet()) {
                window.$notify['error'](
                    {
                        message: "Chrome Extension IWallet Install",
                        description:t('PleaseInstall')
                    }
                );
                setAddress('')
                return
            }

            if (!isLogin()) {

                window.IWalletJS.enable().then((account) => {
                }).catch((err)=>{
                    // IWallet 지갑잠금 이었을 경우 기존 컨넥트하였을경우 정보를 인식 못하는 버그로 인해 알림 메시지로 안내
                    // 새로고침 reload 를 해야 IWallet 정보를 인식함
                    if(err.type == "locked"){
                        window.$notify['error'](
                            {
                                message: "Chrome Extension IWallet Locked",
                                description:"Chrome Extension IWallet will be UnLocked After Browser Refresh!!"
                            }
                        );
                    }else{
                        window.$notify['error'](
                            {
                                message: "Chrome Extension IWallet NotConnected",
                                description: t('PleaseConnect')
                            }
                        );
                    }
                })
                setAddress('')
                return;
            }

            window.IWalletJS.enable().then((account) => {

                if (account) {
                    const iost = window.IWalletJS.newIOST(window.IOST);
                    setAddress(account)
                    window.$message.success(t('Connected'))
                } else {
                    setAddress('')
                }
            })

        }catch (err) {
            console.error(err.message)
            setAddress('')
        }
    }

    const disconnectIWallet = async () => {

        if (hasIWallet()) {

            let newToken = {}

            // token 별 balance 초기화
            Object.keys(token).map(key => {
                newToken[key] = {
                    tokenName: key,
                    balance: 0
                }
            })

            setToken(newToken)

            window.$notify['error'](
                {
                    message: "Chrome Extension IWallet Disconnected",
                    description:t('Disconnected')
                }
            );
        }

        setAddress('')
    }

    return {hasIWallet, isLogin, address, connectIWallet, disconnectIWallet}
};

export default useIWallet;
