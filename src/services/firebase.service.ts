import * as firebase from 'firebase/app';
import 'firebase/firestore';
import * as uuid from 'uuid';
export class FirebaseService {

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCThyp2XTKCTlJXB7Ej27HY_BL1irnyEnM",
      authDomain: "webmarker-3dd8c.firebaseapp.com",
      databaseURL: "https://webmarker-3dd8c.firebaseio.com",
      projectId: "webmarker-3dd8c",
      storageBucket: "webmarker-3dd8c.appspot.com",
      messagingSenderId: "199422612040",
      appId: "1:199422612040:web:7a65ac697f99023450be7d"
    };

    /* Initialize firebase with your configuration */
    firebase.initializeApp(firebaseConfig);
  }



  async getBase64(id: string) {
    const db = firebase.firestore();
    const existingAudio = await db.collection('audios').doc(id).get();
    if (existingAudio.exists) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const data = existingAudio!.data()! as {id: string; base64: string};
      console.log(data);
      return data.base64;
    }
    return '';
  }

  async saveBase64(id: string, base64: string) {
    const db = firebase.firestore();
    db.collection('audios').doc(id).set({
      id: id,
      base64: base64
    });
  }
}