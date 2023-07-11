import mongoose, { Document, Model, model, Schema } from "mongoose";
import symbols from "./symbols";
import { floatPositions } from '../../utils/misc'
import transactions from "./transactions";
import ws from "../../lib/ws";
import { formatDate } from "../../utils/formatDate";

export interface IFuturesOps {
  futureId?: string
  walletId: string
  symbolName: string
  stableCoin: string
  usdAmount: number
  leverage: number
  amount?: number
  operationType: string
  entryPrice: number
  closePrice?: number
  stopLoss?: number
  takeProfit?: number
  createdBy: string
  updatedBy?: string
  createdAt?: Date
  updatedAt?: Date
  isClose?: boolean
  isStart: boolean
  isActive?: boolean
}
interface IFuturesOpsDocument extends IFuturesOps, Document {}

class FuturesOps {
  //#region private
  private _model: Model<IFuturesOpsDocument>;
  static instance:FuturesOps
  constructor() {
    const transactionSchema = new Schema({
      walletId: { type: String, required: true },
      symbolName: { type: String, required: true, uppercase: true },
      stableCoin: { type: String, required: true, lowercase: true },
      usdAmount: { type: Number, required: true },
      leverage: { type: Number, required: true },
      amount: { type: Number, required: true },
      operationType: { type: String, required: true },
      entryPrice: { type: Number, required: true },
      closePrice: { type: Number },
      stopLoss: { type: Number },
      takeProfit: { type: Number },
      createdBy: { type: String, required: true },
      updatedBy: { type: String },
      createdAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      updatedAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      isClose: { type: Boolean, default: false },
      isStart: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
    });
    this._model = model<IFuturesOpsDocument>('VSP004', transactionSchema);
  }
  //#endregion
  public static getInstace = () => {
    if(!this.instance)
      this.instance = new FuturesOps()
    return this.instance
  }
  private save = async (futureOp:IFuturesOps) => {
    if(futureOp.futureId){
      await this._model.findByIdAndUpdate(futureOp.futureId, futureOp)
      return
    }
    const insert = new this._model(futureOp)
    return await insert.save()
  }
  private getClosePercent:any = async (symbolName:string, usdAmount:number, leverage:number) => {
    const symbol = await symbols.findSymbol(symbolName)
    if(!symbol)
      return 0
    if(leverage > symbol.maxLeverage)
      return 0
    return (((usdAmount * leverage) * symbol.marginFee) / usdAmount)
  }
  public getCountActiveOps = () => this._model.aggregate([
    {
      $match: {isActive: true}
    },
    {
      $group: {
        _id: {symbolName: '$symbolName', isClose: '$isClose'}, // Campo por el que deseas agrupar
        count: { $sum: 1}, // Contador de registros en cada grupo
      }
    }
  ])
  public getOpsBySymbol = (symbolName:string, allOps=false) => 
    this._model.find(allOps ? 
      {symbolName, isStart: true, isClose: false} : 
      {symbolName, isClose: false})
  public openLongShort = async (futureOp:IFuturesOps) => {
    const { usdAmount, leverage, symbolName, entryPrice, operationType } = futureOp
    futureOp.amount = Number((((usdAmount) * leverage)/entryPrice > 0.0009 ? ((usdAmount * leverage)/entryPrice).toFixed(floatPositions(entryPrice, true)) : 0))
    if(futureOp.amount < 0)
      throw 'insuficient balance'
    if(futureOp.amount < 0.001)
      throw 'insuficient balance'
    const closePercent = await this.getClosePercent(symbolName, usdAmount, leverage)
    futureOp.closePrice = ((usdAmount * (.995 - closePercent)) / (operationType == 'BUY' ? -futureOp.amount : futureOp.amount)) + entryPrice
    await this.save(futureOp)
    await transactions.save({
      ...futureOp,
      cryptoName: futureOp.stableCoin,
      amount: -futureOp.usdAmount,
      clientId: futureOp.createdBy,
      desc: `Futures Ops ${symbolName} ${operationType}: -${usdAmount}`
    })
    ws.checkOnOffWs()
  }

  public openShort = () => {

  }
  public validateForEntryOps = async (symbolName:string, currPrice:number) => {
    const entryOps = await this._model.updateMany({
      symbolName, 
      isStart: false,
      $or: [
        {operationType: 'BUY', entryPrice: { $gte: currPrice }}, 
        {operationType: 'SELL', entryPrice: { $lte: currPrice }}
      ] 
    },{ $set: {isStart: true} })
    if(entryOps.modifiedCount)
      console.log(`x${entryOps.modifiedCount} Open Operation ${symbolName}: ${currPrice} at ${formatDate(new Date(Date.now()), 'dd/MM hh:mm')}`)
  }
  public validateForDeadOps = async (symbolName:string, currPrice:number) => {
    const dead = await this._model.updateMany({
      symbolName, 
      isStart: true,
      isClose: false,
      $or: [
        {operationType: 'BUY', closePrice: { $gte: currPrice }}, 
        {operationType: 'SELL', closePrice: { $lte: currPrice }}
      ] 
    },{ $set: {isClose: true} })
    if(dead.modifiedCount)
      console.log(`x${dead.modifiedCount} Dead Operation ${symbolName}: ${currPrice} at ${formatDate(new Date(Date.now()), 'dd/MM hh:mm')}`)
  }
  public validateForTPSLOps = async (symbolName:string, currPrice:number) => {
    const trans = await this._model.find({
      symbolName, 
      isStart: true,
      isClose: false,
      $or: [
        {operationType: 'BUY', stopLoss: { $gte: currPrice }}, 
        {operationType: 'BUY', takeProfit: { $lte: currPrice }}, 
        {operationType: 'SELL', stopLoss: { $lte: currPrice }},
        {operationType: 'SELL', takeProfit: { $gte: currPrice }},
      ] 
    })
    for(let i=0; i<trans.length; i++){
      const transaction:any = trans[i]
      const gains = (currPrice - transaction.entryPrice) * ((transaction.amount ?? 0) * ((currPrice - transaction.entryPrice) > 0 ? .99 : 1))
      await this.save({...transaction._doc, futureId: transaction._id, isClose: true})
      await transactions.save({
        ...transaction._doc,
        _id: undefined,
        cryptoName: transaction.stableCoin,
        amount: transaction.usdAmount + gains,
        clientId: transaction.createdBy,
        desc: `Futures gains in ${transaction.symbolName}: ${gains}`
      })
      console.log(`Close Operation ${transaction.symbolName}: ${currPrice}, gains: ${gains} at ${formatDate(new Date(Date.now()), 'dd/MM hh:mm')}`)
    }
  }
  public validateOpenCloseOps = async (symbolName:string, currPrice:number) => {
    await this.validateForEntryOps(symbolName, currPrice)
    await this.validateForDeadOps(symbolName, currPrice)
    await this.validateForTPSLOps(symbolName, currPrice)
    ws.checkOnOffWs()
  }
}
  
export default FuturesOps.getInstace();