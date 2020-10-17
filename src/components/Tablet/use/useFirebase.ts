// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";
import useWebRTC from '../../../lib/webRTC'

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
  const { connectHost } = useWebRTC()
  const setAndConnect = (me: string) => {
    store.me.set(me)
    connectHost()
  }
  const init = () => {
    firebase.initializeApp(firebaseConfig)
  }
  const checkLogin = async () => {
    try {
      const result = await firebase.auth().getRedirectResult()
      const user = result.user
      if (user) {
        const token = await user.getIdToken(false)
        setAndConnect(token)
      } else {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            user.getIdToken(false).then(token => setAndConnect(token))
          } else {
            console.log('not login')
          }
        });
      }
    } catch (e) {
      console.error(e)
    }
  }
  const github = async () => {
    const provider = new firebase.auth.GithubAuthProvider();
    await firebase.auth().signInWithRedirect(provider);
  }
  const google = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithRedirect(provider);
  }
  const original = async (id: string) => {
    setAndConnect(`original${id}`)
  }
  return { init, github, google, original, checkLogin }
}

export default useFirebase
