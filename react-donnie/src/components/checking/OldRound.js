import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import useSize from "~/hooks/useSize";
import ComUtil from "~/util/ComUtil";
import {useTranslation} from "react-i18next";
import Properties from '~/properties'
import {Button, Div, Flex, Right, GridColumns, XCenter} from "~/styledComponents/shared";
import loadable from "@loadable/component";
import coinList from "~/coinList";
import {Modal} from "antd";
import useModal from "~/hooks/useModal";

const DepositBigCard = loadable(() => import('~/components/common/layouts/DepositBigCard'))
const DepositSmallCard = loadable(() => import('~/components/common/layouts/DepositSmallCard'))

const HarvestWithDraw = loadable( () => import("~/components/common/contents/HarvestWithDraw"));


//{tokenName: 'iost', pool: 'Contract91rNUfUBnFGDdAAgaoUu2U5Dneo1ZYwnqiZxGrWXCWpf' },

const Item = ({number, name, tokenName, pool}) => {

    const {t} = useTranslation()

    const [state, setState] = useState({
        total: null,
        img: null,
        loading: true
    });

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();
    const {size} = useSize()

    useEffect(() => {
        getInfo()
    }, [])

    const onClick = () => {
        setModalState(true)
    }

    const getInfo = async () => {
        const total = await iostApi.getPoolTotalSupply(pool)

        const img = getImg(name)

        setState({
            total,
            img,
            loading: false
        })
    }

    const getImg = (name) => coinList.checking.find(coin => coin.name === name).img

    const {total, img, loading} = state

    return(
        <>
            {
                size !== 'sm' ? (
                        <DepositBigCard
                            number={number} //순위
                            img={img}
                            name={name}
                            mining={'finished'}
                            total={total}
                            buttonText={t('HarvestWithdraw')}
                            loading={loading}
                            onClick={onClick}
                        />
                    ) :
                    (
                        <DepositSmallCard
                            number={number} //순위
                            img={img}
                            name={name}
                            mining={'finished'}
                            total={total}
                            buttonText={t('HarvestWithdraw')}
                            loading={loading}
                            onClick={onClick}
                        />
                    )
            }


            <Modal
                title={`${t('HarvestWithdraw')}${name.toUpperCase()}`}
                visible={modalOpen}
                onCancel={() => setModalState(false)}
                // bodyStyle={{padding: 0}}
                footer={null}
                width={'auto'}
                centered={true}
                focusTriggerAfterClose={false}
                getContainer={false}
                maskClosable={false}
            >
                <HarvestWithDraw
                    name={name}
                    tokenName={window.$tokenName}
                    onClose={() => setModalState(false)}
                    pool={pool}
                />
            </Modal>
        </>
    )
}

const SizeWrapper = ({children}) => {
    const {size} = useSize()
    if (size === 'sm') {
        return (
            <Flex justifyContent={'center'}>
                <GridColumns repeat={1} rowGap={11} width={'90%'}>
                    {children}
                </GridColumns>
            </Flex>
        )
    }else {
        return (
            <Flex flexWrap={'wrap'} justifyContent={'center'}>
                {children}
            </Flex>
        )
    }
}

const Items = ({data}) => {
    return data.map(({name, tokenName, pool}, i) =>
        <Item
            number={i+1}
            name={name}
            tokenName={tokenName}
            pool={pool}
            key={`roundItem${i}`}
        />
    )

}

const OldRound = (props) => {
    const {size} = useSize()

    const [oldRounds, setOldRounds] = useState(Properties.oldAddress)

    return (
        <>
            {
                oldRounds.map(({round, data}, index) =>
                    <Div key={`round${index}`}
                        // bc={'white'}
                         mb={25} rounded={3}>
                        <Flex justifyContent={'center'}>
                            <Div textAlign={size === 'sm' ? 'left' : 'center'}
                                 width={size === 'sm' && '90%'} fontSize={20} fw={500}
                                 pl={size === 'sm' && 8}
                            >{round}Round</Div>
                        </Flex>
                        {/*<Flex justifyContent={'center'}>*/}
                        <SizeWrapper>
                            <Items data={data} />
                        </SizeWrapper>
                        {/*</Flex>*/}
                    </Div>
                )
            }


        </>
    );
};

export default OldRound;
