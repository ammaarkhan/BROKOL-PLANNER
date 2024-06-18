// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBp666x0Sntuu4JZhUNU64sK_TCeUfnyXg",
  authDomain: "brokol-planner-97189.firebaseapp.com",
  projectId: "brokol-planner-97189",
  storageBucket: "brokol-planner-97189.appspot.com",
  messagingSenderId: "796599635208",
  appId: "1:796599635208:web:f0e012708d9860704c30bd",
  measurementId: "G-L3Y219R29X"
};
//(shin) do I need database url? check the website in line 6

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);