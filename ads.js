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
    },
{
      title: "NOVA API!!",
      description: "Você é desenvolvedor de jogos? conheça a api de jogos feita para devs do pocket code! ela permite que você faça jogos premiuns!",
      image: "https://i.imgur.com/YobRQ43.jpeg",
      link: "keyDoc.html",
      expiration: "2025-06-25", // formato YYYY-MM-DD
      once: false,
      chance: 30
    }
    
  ];

  document.addEventListener('DOMContentLoaded', () => {
    
    
   const rand = Math.random()*100
   if(rand >= 50) {
   reduz()
ZuniAds.init(anuncios);
    }
  });
