import { cryptoList } from "../data/cryptoList";
import { getColumnByIndex } from "../utils/getColumnByIndex";
import axios from "./axios";

export const getCryptoPrice = async (cryptoSymbol:string) =>{
  const cryptoName = cryptoList.find(crypto => crypto.symbol == cryptoSymbol)
  if(!cryptoName)
    return
  const response = await axios({type: 'GET', url:`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoName.name}&vs_currencies=usd`}).then(res => res.data)
  const cryptoPrice = getColumnByIndex(response, 0).usd
  return cryptoPrice
}