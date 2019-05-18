import firebase from "firebase";
import "@firebase/firestore";

const config = {
  apiKey: "*************************",
  authDomain: "*************************",
  databaseURL: "*************************",
  projectId: "*************************",
  storageBucket: "*************************",
  messagingSenderId: "*************************",
  appId: "*************************"
};
// Initialize Firebase
const app = firebase.initializeApp(config);
const firestore = firebase.firestore(app);

export default firestore;
