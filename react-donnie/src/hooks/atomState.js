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
        walletType: 'IWallet',
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

// 내 지갑 로딩
export const walletLoadingState = atom({
    key: 'walletLoadingState',
    default: {
        loading: true
    }
})
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

// Deposit ERC modal state
export const depositERCModalState = atom({
    key: 'depositERCModalState',
    default: false
})

// Withdraw ERC modal state
export const withdrawERCModalState = atom({
    key: 'withdrawERCModalState',
    default: false
})


// Deposit IW (ERC to IRC) modal state
export const depositIWERCModalState = atom({
    key: 'depositIWERCModalState',
    default: {
        uniqueKey:'',
        tokenName:'',
        isOpen:false
    }
})
// Withdraw iwBly(IRC) to Bly(ERC) modal state
export const withdrawIWERCModalState = atom({
    key: 'withdrawIWERCModalState',
    default: {
        uniqueKey:'',
        tokenName:'',
        isOpen:false
    }
})

/* ==== Wallet 정보 END ==== */


// admin 로그인 정보
export const adminState = atom({
    key: 'adminState', // unique ID (with respect to other atoms/selectors)
    default: null, // default value (aka initial value)
});

// 글로벌 현재시간
export const nowState = atom({
    key: 'nowState', // unique ID (with respect to other atoms/selectors)
    default: Date.parse(new Date), // default value (aka initial value)
});

// 로딩상태
// start, stop
export const loadingState = atom({
    key: 'loadingState', // unique ID (with respect to other atoms/selectors)
    default: null, // default value (aka initial value)
});


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