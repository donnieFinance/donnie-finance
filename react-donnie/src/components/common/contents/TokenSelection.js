import React from 'react';
import {Div, Input, Hr, GridColumns} from "~/styledComponents/shared";
import TokenCard from "~/components/common/layouts/TokenCard";

import properties from "~/properties";

// const tokenList = properties.exchange.tokenList

const TokenSelection = ({tokenList, selectedTokenName, disabledTokenNames = [], onItemClick = () => null}) => {
    return (
        <Div bg={'white'}>
            {/*<Div>*/}
            {/*    <Input block rounded={13} placeholder={'Search name or paste address'}/>*/}
            {/*</Div>*/}
            {/*<Hr></Hr>*/}
            <Div>
                {
                    tokenList.map(({tokenName, fullName, tokenAddress}, index) =>
                        <TokenCard
                            key={tokenName+index}
                            tokenName={tokenName}
                            fullName={fullName}
                            tokenAddress={tokenAddress}
                            img={properties.tokenImages[tokenName]}
                            selected={selectedTokenName === tokenName}
                            disabled={disabledTokenNames.includes(tokenName)}
                            onClick={onItemClick}
                        />)
                }
            </Div>
        </Div>
    );
};

export default TokenSelection;
