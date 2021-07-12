import React, {useEffect} from 'react';
import {useRecoilState} from "recoil";
import {idoTicketBalanceState} from "~/hooks/atomState";
import useWallet from "~/hooks/useWallet";
import idoApi from '~/lib/idoApi'

const useIdoTicketBalance = (props) => {
    const [idoTicketBalance, setIdoTicketBalance] = useRecoilState(idoTicketBalanceState)
    const {address} = useWallet()

    useEffect(() => {
        if (address) {
            refetch()
        }else{
            setIdoTicketBalance(0)
        }
    }, [address])

    async function refetch() {
        const balance = await idoApi.getIdoTicketBalance(address)
        setIdoTicketBalance(balance)
    }

    return {idoTicketBalance, refetch}
};

export default useIdoTicketBalance;
