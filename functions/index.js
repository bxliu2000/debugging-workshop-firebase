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

  const firestore = admin.firestore()
  const contestants_col = firestore.collection("contestants")
  const { data } = req.body;
  const updateObj = { latest_time: Date.now() }

  for (const res of data.results) {
    const testName = Object.keys(res)[0];
    const stats = res[testName];

    const tests_run = parseInt(stats["Tests run"])
    const failures = parseInt(stats["Failures"])
    const errors = parseInt(stats["Errors"])
    const acc = (tests_run - failures - errors) / tests_run;

    updateObj[testName] = { acc, tests_run, failures, errors };
  }

  await contestants_col.doc(data.user).set(updateObj).then(success => {
    res.json({ result: success })
  });
})

