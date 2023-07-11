import runner from 'axios'
import { RequestType } from '../data/types/RequestType'

export interface Request {
  url: string
  type: RequestType
  data?: any
}
export const axios = ({type, url, data}:Request) => {
  switch(type){
    case 'GET': 
      return runner.get(url, data)
    case 'POST':
      return runner.post(url, data)
    case 'DELETE':
      return runner.delete(url)
    case 'PUT':
      return runner.put(url, data)
  }
}

export default axios