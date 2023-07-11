import mongoose, { Document, Model, model, Schema } from "mongoose";
import { CollectionName } from "../types";

export interface IVariety {
    varietyId?: string
    name: string
    extra?: string
    collectionName: CollectionName
    desc?: string
    createBy?: string
    updateBy?: string
    createdAt?: Date
    updatedAt?: Date
    isActive?: boolean
}
interface IVarietyDocument extends IVariety, Document {}

const defValues:IVariety[] = [
  { name: "spot", collectionName: "WalletType" },
  { name: "futures", collectionName: "WalletType" },
  { name: "Admin", collectionName: "RolName" },
  { name: "User", collectionName: "RolName" },
  { name: "Buy", collectionName: "TransType" },
  { name: "Sell", collectionName: "TransType" }
]

class Varietys {
  private _model: Model<IVarietyDocument>;
  static instance:Varietys
  //#region private
  constructor() {
    const varietySchema = new Schema({
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
    varietySchema.index({name: 1, collectionName: 1}, { unique: true })
    this._model = model<IVarietyDocument>('VSP000', varietySchema);
    this.instertDefault()
  }

  private async instertDefault(){
    const varietys = await this._model.findOne()
    if(varietys)
      return
    this.saveAll(defValues)
  }
  //#endregion
  public static getInstace = () => {
    if(!this.instance)
      this.instance = new Varietys()
    return this.instance
  }

  public save = async (variety:IVariety) => {
    if(variety.varietyId){
      await this._model.findByIdAndUpdate(variety.varietyId, variety)
      return
    }
    const insert = new this._model(variety)
    insert.save()
  }
  public saveAll = (varietys:IVariety[]) => varietys.map((variety) => this.save(variety))
  public findTransType = () => this._model.find({collectionName: "TRANSTYPE"})
  public findRolName = (rolName:string) => this._model.findOne({ collectionName: "ROLNAME", name: rolName.toUpperCase() })
}
  
export default Varietys.getInstace();