import React, {useState} from 'react';
import {Flex, Div} from "~/styledComponents/shared";
import PageHeading from "~/components/common/layouts/PageHeading";
import {withTranslation} from "react-i18next";
import TargetLaunch from "~/components/common/layouts/TargetLaunch";
import useModal from "~/hooks/useModal";
import {Route, Switch, useHistory} from 'react-router-dom'
import useUsdPrice from "~/hooks/useUsdPrice";
import { useLocation } from 'react-router-dom';
import useSwapPairs from "~/hooks/useSwapPairs";
import SwitchButton from "~/components/common/buttons/SwitchButton";
import loadable from "@loadable/component";

const Swap = loadable(() => import('~/components/exchange/Swap'))
const Liquidity = loadable(() => import('~/components/exchange/Liquidity'))
const AddLiquidity = loadable(() => import('~/components/exchange/AddLiquidity'))
const Bridge = loadable(() => import('./Bridge'))

const pathData = [
    {pathname: '/exchange/swap', name: 'Swap'},
    {pathname: '/exchange/liquidity', name: 'Liquidity'},
    {pathname: '/exchange/bridge', name: 'Bridge'},
]

export default withTranslation()((props) => {

    // extract pathname from location
    const { pathname } = useLocation();

    const history = useHistory()
    //Search all token usd price
    useUsdPrice()

    // [{don: "10.00000000", husd: "30.00000000", invariant: "300.00000000}, ...]
    useSwapPairs()

    const {t} = props;
    const {exchange} = t('menu', {returnObjects: true})

    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal();


    const [ratioNumber,setRatioNumber] = useState(1);

    const onRatio = (e) => {
        const v_Ratio = e;
        onRatioChange(v_Ratio)
    }
    const onRatioChange = (numberVal) => {
        setRatioNumber(numberVal);
    }

    const onTokenClick = (item) => {
        console.log({item})
        if (item.tokenBalance !== undefined) {
            toggle()
        }
    }

    return (
        <Div>
            <PageHeading
                title={exchange.name}
                description={exchange.desc}
            />

            <Flex justifyContent={'center'} pb={80}>
                <Flex justifyContent={'center'} flexDirection={'column'} flexGrow={1}>
                    <Div mb={30}>
                        <SwitchButton data={pathData}/>
                    </Div>

                    <Switch>
                        <Route exact path={'/exchange/swap'} >
                            <Swap />
                        </Route>
                        <Route exact path={'/exchange/liquidity'} >
                            <Liquidity />
                        </Route>
                        <Route exact path={`/exchange/liquidity/add/:symbol1/:symbol2`}>
                            <AddLiquidity />
                        </Route>
                        <Route path={`/exchange/liquidity/add`}>
                            <AddLiquidity />
                        </Route>
                        <Route path={`/exchange/bridge`}>
                            <Bridge />
                        </Route>
                    </Switch>

                </Flex>
            </Flex>

        </Div>
    );



    return (
        <Div>
            <PageHeading
                title={exchange.name}
                description={exchange.desc}
            />
            <TargetLaunch quarter={'2021 Q2'}/>
        </Div>
    );
});