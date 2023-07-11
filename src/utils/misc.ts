export const floatPositions = (cryptoPrice:number, futures=false) => {
  const minToBuy = Number(process.env.MIN_BUY || 10)
  const numberList = `${minToBuy/cryptoPrice}`.split('')
  if(numberList[0] != "0")
    return 2
  let count = 0
  let running = true
  for(var i = 0; i < numberList.length && running; i++) {
    if(numberList[i] == "." || numberList[i] == ","){
      count = 0
      continue
    }
    if(Number(numberList[i]) > 0){
      (count == 0 || !futures) ? count++ : count--
      running = false
    }
    count++
  }
  return count
}