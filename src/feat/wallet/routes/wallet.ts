import { Express } from 'express'
import { body } from 'express-validator'
import { validateBuyAmount, validateClientId, validateSellAmount, validateSymbol, validateUserId } from '../middlewares/validate'
import { validateErrors } from '../../global/generalValidators'
import { buy, create, deposit, getAmount, sell } from '../services/wallet'
import { checkWalletExist } from '../middlewares/checkExist'
const wallet = (app: Express) => {
  const appName = 'wallet'
  app.get(`/${appName}/:clientId`, 
    validateClientId,

  )
  app.get(`/${appName}/getBalance`,
    [
      body("clientId")
        .notEmpty().withMessage("clientId is required"),
      body("walletId")
        .notEmpty().withMessage("walletId is required"),
    ],
    getAmount
  )
  app.post(`/${appName}/create/:userId`,
    validateUserId,
    [
      body("clientId")
        .notEmpty().withMessage("clientId is required")
        .toLowerCase(),
      body("walletName")
        .notEmpty().withMessage("walletName is required")
        .toLowerCase(),
      body("desc")
    ],
    validateErrors,
    create
  )
  app.post(`/${appName}/deposit/:clientId`,
    validateClientId,
    [
      body("walletId")
        .notEmpty().withMessage("walletId is required"),
      body("cryptoName")
        .notEmpty().withMessage("cryptoName is required"),
      body("amount")
        .isInt()
        .custom((value:number) => value > 0).withMessage("amount must be int and greater than 0.")
    ],
    validateErrors,
    checkWalletExist,
    deposit
  )
  app.post(`/${appName}/buy/:symbol`,
    validateSymbol,
    [
      body("clientId")
        .notEmpty().withMessage("clientId is required"),
      body("walletId")
        .notEmpty().withMessage("walletId is required"),
      body("amount")
        .isFloat()
        .custom((value:number) => value > 0).withMessage("amount must be int and greater than 0.")
    ],
    validateErrors,
    checkWalletExist,
    validateBuyAmount,
    buy
  )
  app.post(`/${appName}/sell/:symbol`,
    validateSymbol,
    [
      body("clientId")
        .notEmpty().withMessage("clientId is required"),
      body("walletId")
        .notEmpty().withMessage("walletId is required"),
      body("amount")
        .isFloat()
        .custom((value:number) => value > 0).withMessage("amount must be int and greater than 0.")
    ],
    validateErrors,
    checkWalletExist,
    validateSellAmount,
    sell
  )
}

export default wallet