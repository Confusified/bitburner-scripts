/** @param {NS} ns */
export async function main(ns) {
  // Should be changed to be more modular and make it possible to download from other sources/githubs
  // Also currently immediately executes, which might not always be desirable
  const url = "https://raw.githubusercontent.com/Confusified/bitburner-scripts/main/";
  const fileName = "printHelloWorld.js";

  var randomFileName = "temp_" + generateRandomString() + ".js"
  var success = await ns.wget(url + fileName, randomFileName);
  if (success) ns.toast("Created new file.", 'success', 3000);
  else ns.toast("Failed to download file.", 'error', 3000);

  const randomPID = ns.run(randomFileName);
  ns.ui.openTail(randomPID);
  ns.rm(randomFileName);
}

const generateRandomString = () => {
  return Math.floor(Math.random() * Date.now()).toString(36);
};
