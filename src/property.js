const config = {
  mode:process.env.NODE_ENV
}
const token = {
  name:"DON"
}

const ONE_WEEK = 604800000;
const DAYS60 = 5184000000;
const DAYS30 = 2592000000;

const UNTIL = DAYS30;

const Properties = {

  isTestnet: function() {
    return true;
  }
}
Properties.token = token;
Properties.ONE_WEEK = ONE_WEEK;
Properties.DAYS60 = DAYS60;
Properties.UNTIL = UNTIL;
Properties.IOST_ADDR =  (Properties.isTestnet())?'http://13.52.105.102:30001':'https://api.iost.io';


export default Properties;
