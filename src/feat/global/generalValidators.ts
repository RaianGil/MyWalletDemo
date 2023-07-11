import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import symbols from "../../data/models/symbols";

export const validateErrors = (req: Request, res: Response, next: NextFunction) => validationResult(req).isEmpty() ? next() : res.status(400).json({ errors: validationResult(req).array() });
export const checkSymbolExist = (req: Request, res: Response, next: NextFunction) => symbols.findSymbol(req.body.symbolName).then(resp => {
  !resp ? 
    res.status(404).json({errors:["symbol not found!"]}) :
    req.body.cryptoName = resp.symbolArray.split('-')[1]
})