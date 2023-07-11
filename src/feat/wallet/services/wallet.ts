import { Request, Response } from "express";
import Wallets from "../../../data/models/wallets";
import Transactions from "../../../data/models/transactions";

export const create = (req: Request, res: Response) => 
  Wallets.save({...req.body, createBy: req.params.userId, updateBy:req.params.userId})
    .then(resp => res.status(200).json({message: "wallet created successfully!"}))
    .catch(err => err.code ? res.status(400).json({ errors: ["this wallet already exists"] }) : res.status(500).json({ errors: [err]}))
export const deposit = (req: Request, res: Response) => 
  Transactions.save({...req.body, createBy: req.params.clientId, updateBy:req.params.clientId, clientId:req.params.clientId})
    .then(resp => res.status(200).json({message: "deposit added successfully!"}))
    .catch(err => res.status(500).json({ errors: [err]}))
export const getAmount = (req: Request, res: Response) => Transactions.getAmount(req.body.walletId).then(resp => resp.length == 0 ? res.status(404).json({ message: ["This wallet has no balance"]}) : res.status(200).json({message: resp}))
export const buy = (req: Request, res: Response) => {
  Transactions.buySell({ ...req.body, createBy: req.body.clientId, updateBy:req.body.clientId })
    .then(() => res.status(200).json({message: "buy successfully!"}))
    .catch((err:any) => res.status(500).json({ errors: [err]}))
}
export const sell = (req: Request, res: Response) => {
  Transactions.buySell({ ...req.body, createBy: req.body.clientId, updateBy:req.body.clientId }, true)
    .then(() => res.status(200).json({message: "selled successfully!"}))
    .catch((err:any) => res.status(500).json({ errors: [err]}))
}
export const getFuturesAmount = (req: Request, res: Response) => {
  Transactions.save({...req.body, amount: -req.body.usdAmount })
}