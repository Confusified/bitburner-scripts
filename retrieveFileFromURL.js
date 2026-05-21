/** @param {NS} ns */
export async function main(ns) {
  // This script does not retain the files fetched.
  ns.disableLog("ALL");

  var url = ns.args[0]; // string | null
  var fileName = ns.args[1]; // string | null
  const keepFile = ns.args[2]; // boolean | null
  var executeFile = ns.args[3]; // boolean | null
  if (url == "help") {
    var helpText = "Parameters for '%s':" +
      "\nurl: string | null, This should be the raw content version of the url. Alternatively 'self' and 'null' are accepted and will redirect to Confusified's GitHub." +
      "\nfileName: string | null, This should be the filename including the extension. Providing 'null' will default to a 'Hello World!' script." +
      "\nkeepFile: boolean | null, When provided with 'true', prevents removing the file after it has been downloaded." +
      "\nexecuteFile: boolean | null, When provided with 'true', runs the script after download.";
    ns.tprintf(helpText, ns.getScriptName());
    return;
  }
  ns.ui.openTail();
  if (url == null || url == "self") {
    var urlReason = "No URL provided, using personal GitHub URL.";
    if (url == "self") urlReason = "Using personal GitHub URL.";
    ns.print(urlReason);
    url = "https://raw.githubusercontent.com/Confusified/bitburner-scripts/main/";
  }
  if (fileName == null) {
    ns.print("Filename was not specified. Fetching 'Hello World!' script instead.")
    fileName = "printHelloWorld.js";
  }
  if (keepFile != true) ns.print("File has been identified to be TEMPORARY.");
  if (executeFile != true) ns.print("File will not be run after download.")

  var downloaded_fileName;
  if (keepFile == true) downloaded_fileName = fileName;
  else downloaded_fileName = "temp_" + Math.floor(Math.random() * Date.now()).toString(36) + ".js";

  const success = await ns.wget(url + fileName, downloaded_fileName);
  if (success) ns.toast("Created new file.", 'success', 3000);
  else ns.toast("Failed to download file.", 'error', 3000);

  if (keepFile != true && executeFile != true) {
    executeFile = await ns.prompt("This temporary file has been set to not run after download. Run anyway?", { type: "boolean" })
  }

  if (executeFile == true) {
    const randomPID = ns.run(downloaded_fileName);
    ns.ui.openTail(randomPID);
    ns.printf("Spawned script '%s'", downloaded_fileName);

  }

  if (keepFile != true) {
    while (ns.scriptRunning(downloaded_fileName)) await ns.sleep()
    ns.rm(downloaded_fileName);
    ns.printf("Terminated script '%s'", downloaded_fileName);
  }
}
