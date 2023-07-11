import { NextFunction, Request, Response } from "express";
import { symbolList } from "../../../data/symbolList";
import Transactions from "../../../data/models/transactions";
import { getSymbolPrice } from "../../../lib/binance";
import symbols from "../../../data/models/symbols";

export const validateUserId = (req: Request, res: Response, next: NextFunction) => req.params.userId.trim() ? next() : res.status(400).json({ errors: ["Param: userId is required"] })
export const validateClientId = (req: Request, res: Response, next: NextFunction) => req.params.clientId.trim() ? next() : res.status(400).json({ errors: ["Param: clientId is required"] })
export const validateAmount = (req: Request, res: Response, next: NextFunction) => console.log()
export const validateSymbol = (req: Request, res: Response, next: NextFunction) => symbolList.find(symbol => symbol.symbol == req.params.symbol) ? next() : res.status(404).json({ errors: [`symbol ${req.params.symbol} is not list`] })
export const prueba = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body)
  next()
}
export const validateBuyAmount = async (req: Request, res: Response, next: NextFunction) => {
  const symbolInfo = symbolList.find(symbol => symbol.symbol == req.params.symbol)
  if(!symbolInfo)
    return
  req.body = {...req.body, symbolInfo: symbolInfo}
  const walletAmount = await Transactions.getAmount(req.body.walletId, symbolInfo.pos2).then(res => res.length > 0 ? res[0] : undefined)
  console.log(walletAmount)
  if(walletAmount.amountInUsd > 10.5 && walletAmount.amount > req.body.amount && req.body.amount > 10){
    next()
    return
  }
  res.status(400).json({ errors: [`Insufficient balance ${symbolInfo.pos2}`] })
}
export const validateSellAmount = async (req: Request, res: Response, next: NextFunction) => {
  const symbolInfo = symbolList.find(symbol => symbol.symbol == req.params.symbol)
  const symbolPrice = await getSymbolPrice(req.params.symbol)
  if(!symbolPrice){
    res.status(500).json({ errors: [`Error getting symbol price`]})
    return
  }
  if(!symbolInfo)
    return
  req.body = {...req.body, symbolInfo: symbolInfo}
  const walletAmount = await Transactions.getAmount(req.body.walletId, symbolInfo.pos1).then(res => res.length > 0 ? res[0] : undefined)
  console.log(symbolInfo)
  if(walletAmount.amountInUsd > 10.5 && walletAmount.amount > req.body.amount && (req.body.amount * symbolPrice) > 10){
    next()
    return
  }
  res.status(400).json({ errors: [`Insufficient balance ${symbolInfo.pos1}`] })
}
export const validateFutureAmount = async (req: Request, res: Response, next: NextFunction) => {
  const symbolInfo = await symbols.findSymbol(req.body.symbolName)
  if(!symbolInfo){
    res.status(404).json({ errors: [`Symbol not found!`] })
    return
  }
  req.body = {...req.body, symbolInfo: symbolInfo}
  const walletAmount = await Transactions.getAmount(req.body.walletId, symbolInfo.symbolArray.split('-')[1]).then(res => res.length > 0 ? res[0] : undefined)
  if(walletAmount.amountInUsd > 0 && walletAmount.amount > req.body.usdAmount && req.body.usdAmount > 0){
    next()
    return
  }
  res.status(400).json({ errors: [`Insufficient balance ${symbolInfo.symbolArray.split('-')[1]}`] })
}