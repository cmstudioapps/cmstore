async function start() {
  
  let rs = await prompt("Seu nome:")
  console.log(rs)
  
  setTimeout(()=> {
  if(!rs || rs === "") return start()
  },2000)
}

start()