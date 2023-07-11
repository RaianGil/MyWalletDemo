import { NextFunction, Request, Response } from "express";
import Wallet from "../../../data/models/wallets";

export const checkWalletExist = async (req: Request, res: Response, next: NextFunction) => await Wallet.findById(req.body.walletId) ? next() : res.status(404).json({ errors: ["wallet not found"] })