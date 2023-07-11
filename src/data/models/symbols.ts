import mongoose, { Document, Model, model, Schema } from "mongoose";

export interface ISymbol {
  symbolId?: string
  symbol: string
  cryptoName: string
  symbolArray: string
  marginFee: number
  maxLeverage: number
  createBy?: string
  updateBy?: string
  createdAt?: Date
  updatedAt?: Date
  isActive?: boolean
}
interface ISymbolDocument extends ISymbol, Document {}
const initSymbols:ISymbol[] = [
  { symbol:'BTCUSDT', cryptoName:'BTC', symbolArray:'BTC-USDT', marginFee: 0.004, maxLeverage: 125 },
  { symbol:'ETHUSDT', cryptoName:'ETH', symbolArray:'ETH-USDT', marginFee: 0.005, maxLeverage: 100 },
  { symbol:'BNBUSDT', cryptoName:'BNB', symbolArray:'BNB-USDT', marginFee: 0.005, maxLeverage: 75 },
  { symbol:'XRPUSDT', cryptoName:'XRP', symbolArray:'XRP-USDT', marginFee: 0.005, maxLeverage: 75 },
  { symbol:'ADAUSDT', cryptoName:'ADA', symbolArray:'ADA-USDT', marginFee: 0.005, maxLeverage: 75 },
  { symbol:'SOLUSDT', cryptoName:'SOL', symbolArray:'SOL-USDT', marginFee: 0.01, maxLeverage: 50 },
  { symbol:'TRXUSDT', cryptoName:'TRX', symbolArray:'TRX-USDT', marginFee: 0.0065, maxLeverage: 50 },
  { symbol:'LTCUSDT', cryptoName:'LTC', symbolArray:'LTC-USDT', marginFee: 0.0056, maxLeverage: 75 },
  { symbol:'MATICUSDT', cryptoName:'MATIC', symbolArray:'MATIC-USDT', marginFee: 0.006, maxLeverage: 50 },
  { symbol:'DOTUSDT', cryptoName:'DOT', symbolArray:'DOT-USDT', marginFee: 0.00651, maxLeverage: 50 },
  { symbol:'1000SHIBUSDT', cryptoName:'SHIB', symbolArray:'1000SHIB-USDT', marginFee: 0.0065, maxLeverage: 50 },
  { symbol:'DOGEUSDT', cryptoName:'DOGE', symbolArray:'DOGE-USDT', marginFee: 0.006, maxLeverage: 50 },
  { symbol:'XMRUSDT', cryptoName:'XMR', symbolArray:'XMR-USDT', marginFee: 0.01, maxLeverage: 25 },
  { symbol:'XLMUSDT', cryptoName:'XLM', symbolArray:'XLM-USDT', marginFee: 0.01, maxLeverage: 25 },
  { symbol:'CHZUSDT', cryptoName:'CHZ', symbolArray:'CHZ-USDT', marginFee: 0.012, maxLeverage: 25 },
]
class Symbols {
  //#region private
  private _model: Model<ISymbolDocument>;
  static instance:Symbols
  constructor() {
    const transactionSchema = new Schema({
      symbol: { type: String, required: true, uppercase: true, unique: true },
      cryptoName: { type: String, required: true, lowercase: true },
      symbolArray: { type: String, required: true, lowercase: true },
      marginFee: { type: Number, required: true },
      maxLeverage: { type: Number, required: true },
      createBy: { type: String },
      updateBy: { type: String },
      createdAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      updatedAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      isActive: { type: Boolean, default: true },
    });
    this._model = model<ISymbolDocument>('VSP003', transactionSchema);
    this.instertDefault()
  }
  //#endregion
  public static getInstace = () => {
    if(!this.instance)
      this.instance = new Symbols()
    return this.instance
  }
  private async instertDefault(){
    const symbol = await this._model.findOne()
    if(symbol)
      return
    this.saveAll(initSymbols)
  }
  public save = async (symbol:ISymbol) => {
    if(symbol.symbolId){
      await this._model.findByIdAndUpdate(symbol.symbolId, symbol)
      return
    }
    const insert = new this._model(symbol)
    return await insert.save()
  }
  public saveAll = (symbols:ISymbol[]) => symbols.map((variety) => this.save(variety))
  public findSymbol = (symbol:string) => this._model.findOne({symbol}) 
}
  
export default Symbols.getInstace();