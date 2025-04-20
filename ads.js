let chances = Number(localStorage.getItem("ads1") || 80)

function reduz() {
if(chances >= 20) {

chances -= 3
localStorage.setItem("ads1",chances)

}
}
  const anuncios = [
    {
      title: "Canal oficial!",
      description: "Siga o Canal oficial da cm store e fique mais perto de nós🎮🤳",
      image: "https://i.imgur.com/98G3KnM.png",
      link: "https://whatsapp.com/channel/0029VbAsDEWHwXbFgB7dcL2M",
      expiration: "2025-04-25", // formato YYYY-MM-DD
      once: false,
      chance: chances
    }
    
  ];

  document.addEventListener('DOMContentLoaded', () => {
    
    
   const rand = Math.random()*100
   if(rand >= 50) {
   reduz()
ZuniAds.init(anuncios);
    }
  });
