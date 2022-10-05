/**
 * This file contians basic cloud functions for contest submissions. 
 *
 * We want a Kahoot-like format where each user has a corresponding score
 * that is accumulated per question. There can be a total leaderboard that 
 * ranks the top k users.
 *
 * These functions are invoked via Webhooks from Github Actions. See: 
 *
 */

const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.updateLeaderboard = functions.https.onRequest(async (req, res) => {
  const timestamp = Date.now();
  const firestore = admin.firestore()
  const questions_col = firestore.collection("questions")
  const { data } = req.body;
  const responses = [];

  for (const res of data.results) {
    const testName = Object.keys(res)[0];
    const stats = res[testName];

    const tests_run = parseInt(stats["Tests run"])
    const failures = parseInt(stats["Failures"])
    const errors = parseInt(stats["Errors"])

    const acc = (tests_run - failures - errors) / tests_run;
    functions.logger.info(acc, {structuredData: true})

    const updateObj = {}
    updateObj[data.user] = { acc, timestamp };
    questions_col.doc(testName).set(updateObj).then(res => {
      responses.push(res);
    });
  }
  res.json({ result: responses })
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
//
//
