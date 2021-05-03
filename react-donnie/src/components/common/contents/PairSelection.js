import React, {useEffect, useState} from 'react';
import iostApi from "~/lib/iostApi";
import useWallet from "~/hooks/useWallet";
import {Div, Flex} from "~/styledComponents/shared";
import {SymbolGroup} from "~/components/exchange/Components";
import properties from "~/properties";

import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";
import {Skeleton} from "antd";

const Item = styled(Flex)`
    cursor: pointer;
    &:hover {
        background-color: ${color.light};
    }
    
    ${props => props.selected && `
        color: ${color.info};
    `}
`

const PairSelection = ({selectedLpTokenName, onItemClick = () => null}) => {
    const [pairs, setPairs] = useState()

    useEffect(() => {
        searchPairs()
    }, [])

    const searchPairs = async () => {
        const res = await iostApi.getLpTokenList()
        setPairs(res)
        console.log({res})
    }

    const onClick = (pair) => {
        onItemClick(pair)
        console.log(pair)
    }

    if (!pairs) return <Div p={13} px={24}><Skeleton active/></Div>
    return (
        <Div>
            {
                pairs.map((pair, i) =>
                    <Item key={`pair${i}`} p={13} px={24} cursor={1}
                          selected={pair.lpTokenName === selectedLpTokenName}
                          onClick={onClick.bind(this, pair)}
                    >
                        <SymbolGroup
                            symbol1={pair.symbol1}
                            symbol2={pair.symbol2}
                            size={30}
                        />
                        <Div mx={10}>
                            {pair.dpLpTokenName}
                        </Div>
                        <Div>
                            {`${pair.symbol1.toUpperCase()}/${pair.symbol2.toUpperCase()}`}
                        </Div>
                    </Item>

                )
            }

        </Div>
    );
};

export default PairSelection;
