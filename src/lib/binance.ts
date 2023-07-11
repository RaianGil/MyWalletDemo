import axios from "./axios"

export const getSymbolPrice = (symbol:string) => 
  axios({
    type: 'GET', 
    url: 'https://api.binance.com/api/v3/ticker/price', 
    data: {
      params: { symbol }
    }
  }).then(res => 
    res.data ? Number(res.data.price) : undefined)
