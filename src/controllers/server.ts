import express from 'express'
import { connect } from 'mongoose'
import cors from 'cors';
import { Express, json } from "express"
import morgan from "morgan";
import wallet from '../feat/wallet';
import future from '../feat/futures/routes/future';
import ws from '../lib/ws';

export class Server {
  app: Express
  constructor() {
    this.app = express()
    this.config()
  }

  private async config () {
    this.loadMiddlewares(this.app)
    this.loadRoutes(this.app)
    ws.checkOnOffWs()
  }

  private loadMiddlewares = (app:Express) => {
    app.use(json())
    app.use(cors())
    app.use(morgan("tiny"))
    app.set('port', process.env.PORT || 3000)
  }

  private loadRoutes = (app:Express) => {
    wallet(app)
    future(app)
  }

  public async start() {
    await connect(process.env.MONGO_URI || "mongodb://localhost:27017/MyDemoWallet?authSource=admin")
    this.app.listen(this.app.get('port'), () => console.log('Server listening in port', this.app.get('port')));
  }
}