import React, {useEffect, useState} from 'react';
import idoApi from "~/lib/idoApi";
import useWallet from "~/hooks/useWallet";

const useTicketBalance = () => {

    const {address} = useWallet()
    const [balance, setBalance] = useState()

    useEffect(() => {
        if (address){
            fetchBalance()
        }
    }, [address])

    async function fetchBalance(){
        const data = await idoApi.getIdoTicketBalance(address)
        setBalance(data)
    }

    return [balance, fetchBalance]
};

export default useTicketBalance;
