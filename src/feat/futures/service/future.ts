import futuresOps from "../../../data/models/futuresOperations"
import { Request, Response } from "express";
import ws from "../../../lib/ws";

export const buy = (req: Request, res: Response) => {
  futuresOps.openLongShort({...req.body,
    createdBy: 'system',
    operationType: 'BUY'
  })
    .then(resp => res.sendStatus(200))
    .catch(err => res.status(400).json({ errors: [err] }))
}

export const sell = (req: Request, res: Response) => {
  futuresOps.openLongShort({...req.body,
    createdBy: 'system',
    operationType: 'SELL'
  })
    .then(resp => res.sendStatus(200))
    .catch(err => res.status(400).json({ errors: [err] }))
}

export const changePrice = async (req: Request, res: Response) => {
  const ops = await futuresOps.getOpsBySymbol(req.params.symbolName).then(resp => resp)
  const currPrice = ws.getPrice(req.params.symbolName)
  var prueba = ops.map((op:any) => ({...op._doc, gain: (currPrice - op.entryPrice) * ((op.amount ?? 0) * ((currPrice - op.entryPrice) > 0 ? .99 : 1))}))
  res.status(200).json({data: [prueba]})
}