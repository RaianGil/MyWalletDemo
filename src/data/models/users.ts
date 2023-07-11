import mongoose, { Document, Model, model, Schema } from "mongoose";
import varietys from "./varietys";

export interface IUser {
    userId?: string
    username: string
    password: string
    rol: string
    createBy?: string
    updateBy?: string
    createdAt?: Date
    updatedAt?: Date
    isActive?: boolean
}
interface IUserDocument extends IUser, Document {}

const defValues:any = async () => { 
  const rolAdmin = await varietys.findRolName("ADMIN")
  if(rolAdmin)
    return [
      { username: "admin", password: "WalletType", rol: rolAdmin._id, createBy: "SYSTEM" },
      { username: "spot", password: "WalletType", rol: rolAdmin._id, createBy: "SYSTEM" }
    ]
  return null
}

class Varietys {
  private _model: Model<IUserDocument>;
  static instance:Varietys
  //#region private
  constructor() {
    const transactionSchema = new Schema({
      name: { type: String, required: true, uppercase: true },
      extra: { type: String },
      collectionName: { type: String, required: true, uppercase: true },
      desc: { type: String },
      createBy: { type: String, required: true, lowercase: true },
      updateBy: { type: String },
      createdAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      updatedAt: { type: mongoose.Schema.Types.Date, default: Date.now },
      isActive: { type: Boolean, default: true },
    });
    transactionSchema.index({name: 1, collectionName: 1}, { unique: true })
    this._model = model<IUserDocument>('VSP000', transactionSchema);
    this.instertDefault()
  }

  private async instertDefault(){
    const transactions = await this._model.findOne()
    // if(transactions)
    //   return
    this.saveAll(defValues)
  }
  //#endregion
  public static getInstace = () => {
    if(!this.instance)
      this.instance = new Varietys()
    return this.instance
  }

  public save = async (user:IUser) => {
    if(user.userId){
      await this._model.findByIdAndUpdate(user.userId, user)
      return
    }
    const insert = new this._model(user)
    insert.save()
  }
  public saveAll = (varietys:IUser[]) => varietys.map((variety) => this.save(variety))
  public findTransType = () => this._model.find({collectionName: "TransType"})
}
  
export default Varietys.getInstace();