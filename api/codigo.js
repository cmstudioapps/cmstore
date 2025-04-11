import admin from 'firebase-admin';

const serviceAccount = {
  type: "service_account",
  project_id: "jjgg-b3b0d",
  private_key_id: "09118a351d86702d1867dd5c3c76a73691505279",
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-jjifv@jjgg-b3b0d.iam.gserviceaccount.com",
  client_id: "100836265193901724254",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jjifv%40jjgg-b3b0d.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jjgg-b3b0d-default-rtdb.firebaseio.com"
  });
}

export default async function handler(req, res) {
  const email = "cm@gmail.com";
  const password = "cm44";

  try {
    const user = await admin.auth().getUserByEmail(email);
    res.status(200).json({ message: 'Usuário já existe', uid: user.uid });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      try {
        const userRecord = await admin.auth().createUser({ email, password });
        res.status(200).json({ message: 'Usuário criado com sucesso', uid: userRecord.uid });
      } catch (createError) {
        res.status(500).json({ error: 'Erro ao criar usuário', details: createError.message });
      }
    } else {
      res.status(500).json({ error: 'Erro ao verificar usuário', details: error.message });
    }
  }
}