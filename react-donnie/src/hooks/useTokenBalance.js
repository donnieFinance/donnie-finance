import React, {useEffect} from 'react';
import iostApi from "~/lib/iostApi";
import useIWallet from "~/hooks/useIWallet";
import {useRecoilState} from "recoil";
import {myTokenSelector, tokenState} from '~/hooks/atomState'

const useTokenBalance = ({tokenName}) => {

    const [token, setBalance] = useRecoilState(myTokenSelector({tokenName}))

    const {address} = useIWallet()

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
    return [token]
};

export default useTokenBalance;
