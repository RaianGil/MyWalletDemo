import futuresOps from "../data/models/futuresOperations"
import { formatDate } from "../utils/formatDate"
import WebSocket from "ws"

let none:any
class WS {
  private static instance:WS
  private wsList:{name:string, price:number, ws:any}[] = []
  constructor(){
    // this.wsList = this.wsList.map((singleWs:any) => ({...singleWs, ws: this.initSymbol(singleWs.name)}))
  }

  public static getInstace(){
    if(!this.instance)
      this.instance = new WS()
    return this.instance
  }

  public async checkOnOffWs(){
    const allOps = await futuresOps.getCountActiveOps()
    if(allOps.length == 0)
      return this.closeAll()
    allOps.map(({_id}:any) => {
    allOps.filter(op => op._id.symbolName == _id.symbolName).length == 2 ? 
        this.connect(_id.symbolName) : 
        allOps.filter(op => op._id.symbolName == _id.symbolName)[0]._id.isClose ? 
          this.close(_id.symbolName) : this.connect(_id.symbolName)
    })
  }

  public getPrice = (symbolName:string) => this.wsList.find(({name}:any) => name == symbolName)?.price ?? 0
  public closeAll = () => {
    this.wsList.map(ws => this.close(ws.name))
  }
  public close(symbolName:string){
    if(!this.wsList.find(ws => ws.name == symbolName))
      return
    const wsIndex = this.wsList.findIndex(ws => ws.name == symbolName)
    if(this.wsList[wsIndex].ws.readyState !== WebSocket.OPEN)
      return
      
    this.wsList[wsIndex].ws.close()
    delete this.wsList[wsIndex].ws
    this.wsList = this.wsList.filter(ws => ws.name != symbolName)
  }

  public connect (symbolName:string) {
    if(this.wsList.find(ws => ws.name == symbolName) != null)
      return
    const ws = new WebSocket(`wss://fstream.binance.com/stream?streams=${symbolName.toLowerCase()}@ticker`)
    this.wsList
    ws.onopen = () => {
      console.log(`Binance Futures '${symbolName}' is connected Successfully! ${formatDate(new Date(Date.now()), 'dd/MM hh:mm')}`)
    }
    ws.onmessage = ({data}:any) => {
      const currPrice = Number(JSON.parse(data.toString()).data.c)
      if(isNaN(currPrice) || currPrice == 0)
        return
      if(this.wsList[this.wsList.findIndex(ws => ws.name == symbolName)].price)
        this.wsList[this.wsList.findIndex(ws => ws.name == symbolName)].price = currPrice
      futuresOps.validateOpenCloseOps(symbolName, currPrice)
    }
    ws.onerror = (error:any) => {
      console.error(`Connection with Binance Futures '${symbolName}' is failed`, error)
    }
    ws.onclose = () => {
      console.log(`Ws connection with ${symbolName} is close at ${formatDate(new Date(Date.now()), 'dd/MM hh:mm')}`)
    }
    this.wsList = [...this.wsList, {name: symbolName, ws, price: 0}]
  }
}

export default WS.getInstace()