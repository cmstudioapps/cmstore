const Idapp = "a4f0c78a-3931-4258-998a-9a79e9a5e314";

window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: Idapp,
    
    notifyButton: {
      enable: true, // Exibe o botão de ativação
    },
  });
  
  // Atrasar a solicitação de permissão por 5 segundos (5000ms)
  setTimeout(function() {
    OneSignal.showSlidedownPrompt();
  }, 5000); // Tempo em milissegundos (5 segundos)
});

function notifica() {
  fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "os_v2_app_utympcrzgfbfrgmktj46tjpdcqhmozjazbbuqxnseihxszmijaw3u4t3jvtpl66lm3mwgyvgq3hfhbfgktbx2gh3fgosz5zvaop5fcy"
      },
      body: JSON.stringify({
        app_id: "a4f0c78a-3931-4258-998a-9a79e9a5e314",
        included_segments: ["Subscribed Users"],
        headings: { en: "Testando" },
        contents: { en: "Mensagem personalizada" }
      })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Erro:", error));
}