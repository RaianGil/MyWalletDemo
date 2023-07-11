import { Request, Response, NextFunction } from "express";
import symbols from "../../data/models/symbols";

export const getStable = async (req: Request, res: Response, next: NextFunction) => {
  const symbolName = req.params.symbolName ?? req.body.symbolName
  const symbolArray = await symbols.findSymbol(symbolName).then(resp => resp ? resp.symbolArray : undefined)
  if(!symbolArray){
    res.status(404).json({error: ['Symbol not found!']})
    return
  }
  req.body.stableCoin = symbolArray.split('-')[1]
  next()
}