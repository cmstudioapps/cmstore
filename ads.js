let chances = Number(localStorage.getItem("ads1") || 80)

if(chances >= 20) {

chances -= 1
localStorage.setItem("ads1",chances)

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
    ZuniAds.init(anuncios);
  });
