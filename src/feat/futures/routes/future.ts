import { Express } from 'express'
import { buy, changePrice, sell } from '../service/future'
import { body } from 'express-validator'
import { validateErrors } from '../../global/generalValidators'
import { checkWalletExist } from '../../wallet/middlewares/checkExist'
import { validateFutureAmount } from '../../wallet/middlewares/validate'
import { getStable } from '../../global/getValues'

const future = (app:Express) => {
  const appName = 'futures'
  app.post(
    `/${appName}/long`,
    [
      body("symbolName")
        .notEmpty().withMessage("symbolName is required"),
      body("leverage")
        .isInt()
        .custom((value:number) => value > 0).withMessage("amount must be int and greater than 0."),
      body("usdAmount")
      .isFloat()
      .custom((value:number) => value > 0).withMessage("usdAmount must be int and greater than 0."),
      body("entryPrice")
        .isFloat()
        .custom((value:number) => value > 0).withMessage("entryPrice must be int and greater than 0."),
      body("walletId")
        .notEmpty().withMessage("walletId is required")
    ],
    validateErrors,
    checkWalletExist,
    getStable,
    validateFutureAmount,
    buy
  )
  app.post(
    `/${appName}/short`,
    [
      body("symbolName")
        .notEmpty().withMessage("symbolName is required"),
      body("leverage")
        .isInt()
        .custom((value:number) => value > 0).withMessage("amount must be int and greater than 0."),
      body("usdAmount")
      .isFloat()
      .custom((value:number) => value > 0).withMessage("usdAmount must be int and greater than 0."),
      body("entryPrice")
        .isFloat()
        .custom((value:number) => value > 0).withMessage("entryPrice must be int and greater than 0."),
      body("walletId")
        .notEmpty().withMessage("walletId is required")
    ],
    validateErrors,
    checkWalletExist,
    getStable,
    validateFutureAmount,
    sell
  )
  app.post(
    `/${appName}/changePrice/:symbolName`,
    [
      body("currPrice")
        .isFloat()
        .custom((value:number) => value > 0).withMessage("currPrice must be int and greater than 0."),
    ],
    getStable,
    changePrice
  )
}

export default future