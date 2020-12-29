import {atom, selector, selectorFamily, useRecoilValue} from 'recoil'
import coin_iost_icon from "~/assets/coin_iost.png";
import coin_don_icon from "~/assets/coin_don.png";
import coinList from "~/coinList";
import ImgIost from "~/assets/coin_iost.png";
import ImgDon from "~/assets/coin_don.png";

/*
    사용법 [useRecoilState]
    설명 : state의 get, set 모두 팔요한 곳에 사용

    import {useRecoilState} from 'recoil'
    import {globalState} from "~/hooks/atomState";

    //hooks 내부에서..
    //get 인 globalState, set인 setGlobalState 모두 사용가능
    const [globalState, setGlobalState] = useRecoilState(globalState);

*/

// globalState 정보
export const globalState = atom({
    key: 'globalState', // unique ID (with respect to other atoms/selectors)
    default: {
        address: null,
        disConnect: false
    }
});

// window size : lg, md, sm
export const windowSizeState = atom({
    key: 'windowSizeState',
    default: {
        size: ''  //lg, md, sm
    }
})

// scroll position : pageYOffset, ...
export const scrollPositionState = atom({
    key: 'scrollPositionState',
    default: {
        pageYOffset: 0
    }
})


export const globalStateSelector = selector({
    key: 'globalStateSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const state = get(globalState);
        return state;
    }
});

// 내 지갑 주소
export const myAddressSelector = selector({
    key: 'globalStateAddress', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const state = get(globalState);
        return state.address;
    },
    set: ({set}, address) => {
        set (
            globalState,
            (prevState) => ({
                ...prevState,
                address: address
            })
        )
    }
});
// 지갑 연결 유무
export const disConnectSelector = selector({
    key: 'disConnectSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const state = get(globalState);
        return state.disConnect;
    },
    set: ({set}, disConnect) => {
        set (
            globalState,
            (prevState) => ({
                ...prevState,
                disConnect: disConnect
            })
        )
    }
});

/* ==== Wallet 정보 START ==== */
// 토큰 잔액 정보
export const tokenState = atom({
    key: 'tokenState',
    default: {
        iost: {
            tokenName: 'iost',
            balance: null
        },
        don: {
            tokenName: 'don',
            balance: null
        }

    }
})
// 내 해당 토큰 잔액 정보
export const myTokenSelector = selectorFamily({
    key: 'myTokenState', // unique ID (with respect to other atoms/selectors)
    get: ({tokenName}) => ({get}) => {
        const state = get(tokenState);
        return state[tokenName]
    },
    set: ({tokenName}) => ({set}, balance) => {
        set (
            tokenState,
            (prevState) => ({
                ...prevState,
                [tokenName]: {
                    tokenName: tokenName,
                    balance: balance
                }
            })
        )
    }
});

// connect Wallet modal state
export const connectWalletModalState = atom({
    key: 'connectWalletModalState',
    default: false
})

// menu modal state on Small size like (md, sm)
export const menuModalState = atom({
    key: 'menuModalState',
    default: false
})

// My don modal state
export const myDonModalState = atom({
    key: 'myDonModalState',
    default: false
})

/* ==== Wallet 정보 END ==== */

/* ==== Checking State 정보 START ==== */
// Checking State 정보
// export const checkingState = atom({
//     key: 'checkingState',
//     default: {
//         coinList: [
//             {
//                 name: 'iost',
//                 img: coin_iost_icon,
//                 total: '...',
//                 usd: 0,
//                 totalBalance: 0,
//                 status: 0,
//                 isOpen: true,
//                 decimals: 8,
//                 precision: 8,
//                 rate: 0,
//                 loading: true
//             },
//             {
//                 name: 'don',
//                 img: coin_don_icon,
//                 total: '...',
//                 usd: 0,
//                 totalBalance: 0,
//                 status: 0,
//                 isOpen: true,
//                 decimals: 8,
//                 precision: 8,
//                 rate: 0,
//                 loading: true
//             }
//         ],
//         reloadTime:''
//     }
// })

export const checkingStakeState = atom({
    key: 'checkingStakeState',
    default: {
        startTime: '',
        time: '',
        leftTime: null,
        status: 0,
        startInWeek: 0
    }
})

export const checkingCoinListState = atom({
    key: 'checkingCoinListState',
    default: coinList.checking
})

export const checkingCoinListLoadingState = atom({
    key: 'checkingCoinListLoadingState',
    default: true
})

export const checkingReloadTimeState = atom({
    key: 'checkingReloadTimeState',
    default: null
})

// checkingCoinListSelector
// const [coinList, setCoinList] = useRecoilState(checkingCoinListSelector);
export const checkingCoinListSelector = selector({
    key: 'checkingCoinListSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const state = get(checkingCoinListState);
        return state;
    },
    // set: ({set}, coinList) => {
    //     set (
    //         checkingCoinListState,
    //         (prevState) => ({
    //             ...prevState,
    //             coinList
    //         })
    //     )
    // },
});

export const checkingReloadTimeSelector = selector({
    key: 'checkingReloadTimeSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const state = get(checkingReloadTimeState);
        return state;
    },
    set: ({set}, reloadTime) => {
        set (
            checkingReloadTimeState,
            () => (reloadTime)
        )
    }
});

// checkingStakeSelector
// const [stake, setStake] = useRecoilState(checkingStakeSelector);
export const checkingStakeSelector = selector({
    key: 'checkingStakeSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const state = get(checkingStakeState);
        return state;
    },
    set: ({set}, stake) => {
        // console.log("stake-----checkingStakeSelector",stake)
        set (
            checkingStakeState,
            (prevState) => ({
                ...prevState,
                stake
            })
        )
    }
});
export const checkingStakeStatusSelector = selector({
    key: 'checkingStakeStatusSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const stakeState = get(checkingStakeState);
        return stakeState.status;
    },
    set: ({set}, status) => {
        set (
            checkingStakeState,
            (prevState) => ({
                ...prevState,
                status: status
            })
        )
    }
});
export const checkingStakeStartTimeSelector = selector({
    key: 'checkingStakeStartTimeSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const stakeState = get(checkingStakeState);
        return stakeState.startTime;
    },
    set: ({set}, startTime) => {
        set (
            checkingStakeState,
            (prevState) => ({
                ...prevState,
                startTime: startTime
            })
        )
    }
});
export const checkingStakeTimeSelector = selector({
    key: 'checkingStakeTimeSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const stakeState = get(checkingStakeState);
        return stakeState.time;
    },
    set: ({set}, time) => {
        set (
            checkingStakeState,
            (prevState) => ({
                ...prevState,
                time: time
            })
        )
    }
});
export const checkingStakeLeftTimeSelector = selector({
    key: 'checkingStakeLeftTimeSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const stakeState = get(checkingStakeState);
        return stakeState.leftTime;
    },
    set: ({set}, leftTime) => {
        set (
            checkingStakeState,
            (prevState) => ({
                ...prevState,
                leftTime: leftTime
            })
        )
    }
});
export const checkingStakeStartInWeekSelector = selector({
    key: 'checkingStakeStartInWeekSelector', // unique ID (with respect to other atoms/selectors)
    get: ({get}) => {
        const stakeState = get(checkingStakeState);
        return stakeState.startInWeek;
    },
    set: ({set}, startInWeek) => {
        set (
            checkingStakeState,
            (prevState) => ({
                ...prevState,
                startInWeek: startInWeek
            })
        )
    }
});
/* ==== Checking State 정보 END ==== */





/*
    사용법 [useRecoilValue]
    설명: get 전용, 통상적으로 state에 담겨져 있는 값을 가공하여 리턴하거나 특정한 value를 리턴할 때 씀

    import {useRecoilValue} from 'recoil';
    import {globalStateInfo} from '~/hooks/atomState';

    //hooks 내부에서..
    const globalState = useRecoilValue(globalStateInfo);
*/





// import TokenState from '...'
// const [token, setToken] = useRecoilState(TokenState)
//
//
//
// setToken({
//     ...token,
//     [$tokenName]: {
//         tokenName: $tokenName,
//         balance: tokenBalance
//     }
// })