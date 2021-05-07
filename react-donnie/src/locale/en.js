const locale = {
    lang: 'EN',
    selectLanguage: 'Select language',
    connectWallet: 'Connect wallet ',
    connect: 'connect',
    disconnected: 'Disconnect',
    preparing: 'Preparing',
    menu: {
        about: {
            name: 'About',
            desc: 'Decentralized Total Financial Service Provider'
        },
        checking: {
            name: 'Checking & Saving',
            desc: 'Deposit and Withdraw cryptocurrency anytime, anywhere with no fee'
        },
        loan: {
            name: 'Loan',
            desc: 'Borrow and Lend any cryptocurrency with an Algorithmic & Autonomous Interest Rate'
        },
        exchange: {
            name: 'Exchange',
            desc: 'Trade Cryptocurrency-to-Cryptocurrency with Automated Liquidity Provision'
        },
        credit: {
            name: 'Credit Analysis',
            desc: 'Create a secure credit analytics system to be used within the decentralized financial ecosystem'
        },
        payment: {
            name: 'Payment',
            desc: 'Support direct transaction between users through the network'
        },
        portfolio: {
            name: 'Portfolio Mgmt.',
            desc: 'Aggregator service gives advice on users\' cryptocurrency investments and automatically balances users\' digital assets'
        }
    },

    Connected: 'Connected',

    EarnDonnie: 'Earn DON by Providing Liquidity.',
    comingSoon: 'Preparing, coming soon',
    countdown1: 'Service is Running',
    countdown2: 'Countdown to Open ',
    countdownEnd: 'Service ended, please harvest earned DONs',
    depositToMine: 'Deposit to mine',
    information: 'Get more information',
    activityNoStart: 'Not Start!',
    Mining: 'Staked',
    Depositing: 'Staked',
    StagePhase: 'Next Service is Coming Soon...',

    MyDONY: 'My DON',

    cancel: 'Cancel',

    previousRound: 'Previous Round',
    scan: 'SCAN TO CONNECT',
    Provide: 'Deposit {{x}} & Harvest DON',
    get: 'Harvest',
    Approve: 'Approve',
    HarvestWithdraw: 'Harvest & Withdraw',
    HarvestDONY: 'Harvest DON',
    withdraw: 'Withdraw',
    Deposit2: 'Deposit',
    ViewonEtherscan: 'View on IostABC',
    Disconnected: 'Disconnected',
    moreWays: 'more ways coming soon',
    Wanttokeep: 'Want to keep these pools continually mining? Listing assets through DON voting',
    Formoredetails: 'For more details.',
    amountLess: 'amount can\'t less than  {{x}}',
    insufficient: 'insufficient balance ',
    harvest: 'Earned',
    endStake: 'End Stake',
    WalletAuthorization: 'Wallet Authorization',
    PleaseConnect: 'Please Connect to Your Wallet',
    PleaseInstall: 'Use Chrome Extension IOST Wallet (IWallet or Jetstream) To Login',
    NeedRefreshIwallet: 'Refresh Browser! to unlock iWallet chrome-extension',
    NeedRefreshJetstream: 'Refresh Browser! to unlock Jetstream chrome-extension',
    PleaseWallet: 'Use {{x}} to scan code Login',
    lendContent: 'The one-click aggregation lending service launched by Donnie can aggregate current mainstream DeFi lending platforms, such as MakerDAO, Compound, Dharma, dYdX, etc. This will greatly expand the underlying assets that can be used for lending, enhance the user\'s asset liquidity, and optimize the best interest rate, reducing the user\'s borrowing cost.',
    insuranceContent: 'Donnie\'s insurance business, in addition to insurance, adds the aggregated farm and earn of the underwriting pool and the insured pool, which allows the insurer to obtain additional income on the basis of their income, and also allows the insured a certain benefit by transferring some risks to the insurance pool.',
    vaultContent: 'Donnie Vault collection is an income aggregator that automatically selects the highest return of each DeFi product in market in order to to maximize the income for the holding assets in a non-destructive way.',
    authorizing: 'Authorizing, please wait',
    authorizationSuccess: 'Authorization succeeded',
    closePool: 'Temporarily stop production, you can recover your assets and DON',
    annualization: 'APR',
    insufficientBalance: 'insufficient balance',
    CannotEmpty: 'Cannot be Empty',
    ErrorBalance: 'Error',
    DONYTokenAddress: 'DON Smart Contract Address',
    WalletMath: 'Math Wallet',
    WalletHuobi: 'Huobi Wallet',
    message: {
        UserRejected: 'The request was rejected by the user',
        InvalidParam: 'The parameters were invalid',
        InternalError: 'Internal error',
        newWorkError: 'Network error, Please try again later',
        newWorkError1:'Asset balance can’t be obtained, please refresh the page',
        lackOfIgas: 'Your iGAS is lack. Necessary iGAS : ',
        chargeIgasTime: 'iGAS will be charged automatically over time.',
        lackOfIram: 'You should buy 0.1KB of iRAM',
        failedToSend:'transmission failed. please try again.',
        failedToSendSwap:'Swap failed due to concurrent transaction. Try again.',
        jetstreamOnlyIost: 'You can deposit only IOST in Jetstream wallet',
        jetstreamFail: 'Please check igas:1,000,000 & iram:0.1KB'
    },
    depositErc:{
        confirmMsgTitle:'ERC address can be changed, please check before deposit!',
        confirmMsgTitle2:' Minimum deposit: 10 DON, takes 30 minutes',
        confirmMsgTitle3:'Is the ERC DON Token deposit correct?',
        addressTitle:'DON(ERC) address for deposit',
        addressCopy:'Address Copy',
        addressCopyMsg:'Address has been copied',
        addressCopyFailMsg:'Address copying failed',
        loginCheckMsg:'Please check login again with browser refresh'
    },
    withdrawErc:{
        confirmMsgTitle:'Please check your ETH address once more before withdrawal!',
        fee: 'Fee',
        all: 'All',
        memo: 'Memo',
        address: 'Address',
        copy: 'Copy',
        paste: 'Paste',
        availableAmount:'Available volume',
        // withdrawRequestAmount:'Withdrawal volume',
        withdrawAmount:'Withdrawal volume',
        realWithdrawAmount:'Actual receival',
        receptionErcAddress:'Reception ERC Address',
        withdraw: 'Withdrawal',
        withdrawAmountConfirmMsg:'Please check the withdrawal amount.',
        withdrawAmountLimitConfirmMsg:'The withdrawal amount must exceed at least {{x}} DON.',
        receptionErcAddressConfirmMsg:'Please check the recipient ERC address.',
        failedToSend:'IOST DON transmission failed. please try again.',
        withdrawRequestComplateMsg:'The withdrawal application has been completed'
    },
    depositIWErc:{
        confirmMsgTitle:'{{x}} address can be changed, please check before deposit!',
        confirmMsgTitle2:'Minimum deposit {{x}}, takes 30 minutes',
        confirmMsgTitle3:'Are you sending {{x}} token ?',
        addressTitle:'ETH address for deposit',
        addressTitle2:'{{x}} address for deposit',
        addressCopy:'Address Copy',
        addressCopyMsg:'Address has been copied',
        addressCopyFailMsg:'Address copying failed',
        loginCheckMsg:'Please check login again with browser refresh'
    },
    withdrawIWErc:{
        confirmMsgTitle:'Please check your {{x}} address once more before withdrawal!',
        fee: 'Fee',
        all: 'All',
        memo: 'Memo',
        address: 'Address',
        copy: 'Copy',
        paste: 'Paste',
        availableAmount:'Available volume',
        withdrawAmount:'Withdrawal volume',
        realWithdrawAmount:'Actual receival',
        receptionErcAddress:'Reception {{x}} Address',
        withdraw: 'Withdrawal',
        withdrawAmountConfirmMsg:'Please check the withdrawal amount.',
        withdrawAmountLimitConfirmMsg:'The withdrawal amount must exceed at least {{x}}.',
        receptionErcAddressConfirmMsg:'Please check the recipient ERC address.',
        failedToSend:'IOST {{x}} transmission failed. please try again.',
        withdrawRequestMsg:'The withdrawal application has been requested. It will take some time.',
        withdrawRequestComplateMsg:'The withdrawal application has been completed'
    },
    depositBNB:{
        confirmMsgTitle:'{{x}} address can be changed, please check before deposit!',
        confirmMsgTitle2:'Minimum deposit {{x}}, takes 30 minutes',
        confirmMsgTitle3:'Are you sending BNB(BEP20-BSC) token?',
        addressTitle:'BNB(BEP20-BSC) address for deposit',
        addressTitle2:'{{x}} address for deposit',
        addressCopy:'Address Copy',
        addressCopyMsg:'Address has been copied',
        addressCopyFailMsg:'Address copying failed',
        loginCheckMsg:'Please check login again with browser refresh'
    },
    withdrawBNB:{
        confirmMsgTitle:'Please check your BNB(BEP20-BSC) address once more before withdrawal!',
        fee: 'Fee',
        all: 'All',
        memo: 'Memo',
        address: 'Address',
        copy: 'Copy',
        paste: 'Paste',
        availableAmount:'Available volume',
        withdrawAmount:'Withdrawal volume',
        realWithdrawAmount:'Actual receival',
        receptionBepAddress:'Reception BNB(BEP20-BSC) Address',
        withdraw: 'Withdrawal',
        withdrawAmountConfirmMsg:'Please check the withdrawal amount.',
        withdrawAmountLimitConfirmMsg:'The withdrawal amount must exceed at least {{x}}.',
        receptionBepAddressConfirmMsg:'Please check the recipient BNB(BEP20-BSC) address.',
        failedToSend:'IOST {{x}} transmission failed. please try again.',
        withdrawRequestMsg:'The withdrawal application has been requested. It will take some time.',
        withdrawRequestComplateMsg:'The withdrawal application has been completed'
    },
    exchange:{
        swap: 'Swap',
        supply: 'Supply',
        addLiquidity:'Add Liquidity',
        removeLiquidity:'Remove Liquidity',
    },
    warning: 'Warning',
    attemptTitle: 'BEWARE OF SCAM ATTEMPTS!',
    attempt: 'THE CONTRACT ADDRESS IS',
    contactUs: 'Please contact us via info@donnie.finance',

    swapDesc:'Trade tokens in an instant',
    selectToken: 'Select a token',
    enterAmount: 'Enter an amount',
    minimumAmount: 'Must be at least {{x}} amount',
    swap: 'Swap',
    supply: 'Supply',
    insufficientTokenBalance: 'Insufficient {{x}} balance',
    swapPrice: 'Swap Price',
    minReceiveAmountErr: 'Increase amount and try again. Swap result amount is too small',
    slippageTolerance: 'Slippage Tolerance',
    minimumReceived:'Minimum Received',
    minimumReceivedInfo: 'Set according to Slippage Tolerance. Your transaction will revert when price goes under the Minimum Received due to other concurrent transaction.',
    priceImpact:'Price Impact',
    priceImpactInfo:'Positive Price Impact means you pay less than market price, negative means pay more than market price',
    transactionFee:'Transaction Fee',
    transactionFeeInfo:'Total {{x}}% of From Token will be deducted, ({{y}}%-to liquidity provider, {{z}}%-to platform)',

    addLiquidityDesc: 'Add Liquidity to receive LP Tokens',
    myLiquidity: 'My Liquidity',
    myLpToken: 'My LP Token',
    poolShare: 'My pool share',
    totalPool: 'Total Liquidity',
    lpTokenDesc: 'LP Token will be issued in proportion to total liquidity pool. LP Token Balance decides Your pool share in the total liquidity pool.',
    myShareDesc: 'Ratio between 2 tokens will be changed in My Share according to users swap. And token count will increase accumulating swap transaction fees.',
    lpTokenWalletDesc: 'LP Token in My Wallet',
    depositLpToken: 'Deposit LP Token',
    bep20bscDesc: 'BEP20(BSC) - BINANCE SMART CHAIN NETWORK',
    estimatedValue: 'Estimated value'
}

export default locale;
