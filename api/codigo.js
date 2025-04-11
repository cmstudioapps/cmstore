export default function handler(req, res) {
  res.status(200).send("A senha é 1234");
}

const firebaseConfig = {
  apiKey: "AIzaSyAAnH3F02cCHrDo48Iz9x0doKe4JNw3kOY",
  authDomain: "jjgg-b3b0d.firebaseapp.com",
  databaseURL: "https://jjgg-b3b0d-default-rtdb.firebaseio.com",
  projectId: "jjgg-b3b0d",
  storageBucket: "jjgg-b3b0d.firebasestorage.app",
  messagingSenderId: "747741318855",
  appId: "1:747741318855:web:26f9cc4bed5ea64f65b8e2"
};

    firebase.initializeApp(firebaseConfig);

// Função para login ou registro
function loginOrRegister() {
  const email = "cm@gmail.com";
  const password = "cm44";

  // Tenta fazer login com o email e senha
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Usuário logado com sucesso
      console.log("Usuário logado:", userCredential.user);
      alert("Login bem-sucedido!");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // Se o erro for de usuário não encontrado, cria a conta
      if (errorCode === "auth/user-not-found") {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            console.log("Usuário criado:", userCredential.user);
            alert("Conta criada com sucesso!");
          })
          .catch((error) => {
            console.error("Erro ao criar conta:", error.message);
            alert("Erro ao criar conta: " + error.message);
          });
      } else {
        console.error("Erro de login:", errorMessage);
        alert("Erro de login: " + errorMessage);
      }
    });
}

// Função para verificar e chamar login ou registro uma vez por dia
function authenticateOncePerDay() {
  const lastLoginDate = localStorage.getItem("lastLoginDate");
  const currentDate = new Date().toISOString().split('T')[0]; // Pega a data no formato YYYY-MM-DD
  
  // Se a data de login registrada for diferente da data de hoje, chama o login
  if (lastLoginDate !== currentDate) {
    loginOrRegister(); // Chama a função para login ou registro
    localStorage.setItem("lastLoginDate", currentDate); // Atualiza a data do último login
  } else {
    console.log("Usuário já foi autenticado hoje.");
  }
}

// Chama a função de autenticação uma vez por dia
authenticateOncePerDay();