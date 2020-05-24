// const admin = require('firebase-admin');
// const firebase = require('firebase');
// const firebaseInfo = require('../firebase-info');

// firebase.initializeApp(firebaseInfo.firebaseConfig);

// admin.initializeApp({
//   credential: admin.credential.cert(firebaseInfo.serviceAccount),
//   databaseURL: "https://codingplatform-c9738.firebaseio.com"
// });

// const uploadFile = async (from,toPath)=>{
//     var bucket = admin.storage().bucket(`gs://codingplatform-c9738.appspot.com/pratikparmar`);

//     await bucket.upload(from).then(data=>{
//         console.log(data);
//     });
// }

// uploadFile('./firebase.js',"PratikParmar");
