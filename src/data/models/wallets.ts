import mongoose, { Document, Model, model, Schema } from "mongoose";

export interface IWallet {
    walletId?: string
    walletName: string
    clientId: string
    desc?: string
    createBy?: string
    updateBy?: string
    createdAt?: Date
    updatedAt?: Date
    isActive: boolean
}
interface IWalletDocument extends IWallet, Document {}

class Wallets {
  //#region private
  private _model: Model<IWalletDocument>;
  static instance:Wallets
  constructor() {
    const walletSchema = new Schema({
      walletName: { type: String, required: true, lowercase: true },
      clientId: { type: String, required: true, lowercase: true },
      desc: { type: String, lowercase: true },
      createBy: { type: String },
      updateBy: { type: String },
      createdAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      updatedAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      isActive: { type: Boolean, default: true },
    });
    walletSchema.index({walletName: 1, clientId: 1}, { unique: true })
    this._model = model<IWalletDocument>('VSP001', walletSchema);
  }
  //#endregion
  public static getInstace = () => {
    if(!this.instance)
      this.instance = new Wallets()
    return this.instance
  }

  public save = async (wallet:IWallet) => {
    if(wallet.walletId){
      await this._model.findByIdAndUpdate(wallet.walletId, wallet)
      return
    }
    const insert = new this._model(wallet)
    return await insert.save()
  }

  public findById = (id:string) => this._model.findById(id)

}
  
export default Wallets.getInstace();