import http from './http';

//미사용.
export const getPrice = (p) => http({
    method: 'GET',
    url: `/donnie-server/market/price?symbols=eth,bly,usdt,lend`
});
