export default class WalletUtil {

    // localstorage wallet 구분자, 지갑 연결 선택시 구분
    static iostWalletGb () {
        // IWallet or Jetstream
        // Default IWallet
        return localStorage.getItem("IostWalletGb") ? localStorage.getItem("IostWalletGb"):"IWallet"
    }

    // IWallet or Jetstream 지갑 연결 라이브러리 (크롬기반 익스텐션)
    static getMyWallet (_type) {
        const type = _type ? _type : this.iostWalletGb();
        const {IWallet,Jetstream} = window.myWallet;
        const w = {
            walletType:type,
            address: null,
            wallet: null
        }
        if(type ==='IWallet' ) {
            //myWallet.IWallet
            //myWallet.Jetstream
            w.address = (IWallet && IWallet.account && IWallet.account.name) ? IWallet.account.name : null;
            w.wallet = IWallet ? IWallet : null;
            if(w.wallet && !w.wallet.iost) {
                w.wallet.iost = IWallet && IWallet.newIOST(window.IOST)
            }
        } else if(type ==='Jetstream' ) {
            w.address = (Jetstream && Jetstream.account) ? Jetstream.account : null;
            w.wallet = Jetstream ? Jetstream : null;
            if(w.wallet && !w.wallet.iost) {
                w.wallet.iost = Jetstream && Jetstream.newIOST(window.IOST);
            }
        }
        return w;
    }
}