import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import useWallet from "~/hooks/useWallet";
import {useRecoilState} from "recoil";
import {myTokenSelector, tokenState} from '~/hooks/atomState'

const useTokenBalance = (tokenName) => {

    const {address} = useWallet()
    const [balance, setBalance] = useState()//useRecoilState(myTokenSelector({tokenName}))

    useEffect(() => {
        if (address){
            fetchBalance()
        }
    }, [address])

    async function fetchBalance(){
        const data = await iostApi.getTokenBalance({
            address,
            tokenName
        })
        setBalance(data)
    }

    /* return value is..
        {
            tokenName: '',
            balance: 0
        }
    */
    return [balance, fetchBalance]
};

export default useTokenBalance;
