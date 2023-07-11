import mongoose, { Document, Model, model, Schema } from "mongoose";
import { getCryptoPrice } from "../../lib/coinGecko";
import { floatPositions } from "../../utils/misc";
import { getSymbolPrice } from "../../lib/binance";

export interface ITransaction {
  transactionId?: string
  walletId: string
  cryptoName: string
  clientId: string
  amount: number
  desc?: string
  symbolInfo?: any
  createdBy: string
  updateBy?: string
  createdAt?: Date
  updatedAt?: Date
  isActive?: boolean
}
interface ITransactionDocument extends ITransaction, Document {}

class Transactions {
  //#region private
  private _model: Model<ITransactionDocument>;
  static instance:Transactions
  constructor() {
    const transactionSchema = new Schema({
      cryptoName: { type: String, required: true, lowercase: true },
      walletId: { type: String, required: true },
      clientId: { type: String, required: true },
      amount: { type: Number, required: true },
      desc: { type: String },
      createdBy: { type: String, required: true },
      updatedBy: { type: String },
      createdAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      updatedAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      isActive: { type: Boolean, default: true },
    });
    this._model = model<ITransactionDocument>('VSP002', transactionSchema);
  }
  //#endregion
  public static getInstace = () => {
    if(!this.instance)
      this.instance = new Transactions()
    return this.instance
  }
  public save = async (transaction:ITransaction) => {
    if(transaction.transactionId){
      await this._model.findByIdAndUpdate(transaction.transactionId, transaction)
      return
    }
    const insert = new this._model(transaction)
    return await insert.save()
  }
  public getAmount = async (walletId:string, cryptoName="") => {
    const amounts = await this._model.aggregate([
      cryptoName ?
      { $match: { cryptoName: cryptoName.toLowerCase(), walletId: walletId } } :
      { $match: { walletId: walletId } },
      {
      $group: {
        _id: {walletId: '$walletId', cryptoName: '$cryptoName'},
        totalSum: { $sum: '$amount'}
      }
    }])
    if(amounts.length == 0)
      return amounts
    let response:any = []
    for(var i = 0; i < amounts.length; i++) {
      const cryptoPrice = await getCryptoPrice(amounts[i]._id.cryptoName.toUpperCase())
      const floatPos = floatPositions(cryptoPrice)
      response = [...response, {walletId: amounts[i]._id.walletId, cryptoName: amounts[i]._id.cryptoName, amount: Number(amounts[i].totalSum.toFixed(floatPos)), amountInUsd: Number((amounts[i].totalSum * cryptoPrice).toFixed(2))}]
    }
    return response
  }
  public buySell = async (transaction:ITransaction, sell=false) => {
    const { symbol, pos1, pos2 } = transaction.symbolInfo
    const cryptoPrice = await getSymbolPrice(symbol)
    if(!cryptoPrice)
      throw 'error get symbol price'
    transaction.cryptoName = sell ? pos1 : pos2
    transaction.amount = -transaction.amount
    await this.save(transaction)
    const amountFee = (Math.abs(transaction.amount) * 0.995)
    transaction.cryptoName = sell ? pos2 : pos1
    transaction.amount = sell ? (amountFee * cryptoPrice) : (amountFee / cryptoPrice)
    transaction.desc = `${sell ? 'SELL' : 'BUY'} ${pos1}: ${cryptoPrice}`
    await this.save(transaction)
    return 
  }

}
  
export default Transactions.getInstace();