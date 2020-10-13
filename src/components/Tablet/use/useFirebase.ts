// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import { store } from '../../../store'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2VCx8r-3R4Olr7Pa39xMgCjFQgDyoSVI",
  authDomain: "portablerg-auth.firebaseapp.com",
  databaseURL: "https://portablerg-auth.firebaseio.com",
  projectId: "portablerg-auth",
  storageBucket: "portablerg-auth.appspot.com",
  messagingSenderId: "639952935056",
  appId: "1:639952935056:web:c5448ddf71d713fa2e2015",
  measurementId: "G-10X8GS7KQ6"
};

const useFirebase = () => {
  const init = () => {
    firebase.initializeApp(firebaseConfig)
  }
  const github = async () => {
    const provider = new firebase.auth.GithubAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    if (result.user) {
      store.me.set(result.user.uid)
    }
  }
  const google = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    if (result.user) {
      store.me.set(result.user.uid)
    }
  }
  const original = async (id: string) => {
    store.me.set(id)
  }
  return { init, github, google, original }
}

export default useFirebase
