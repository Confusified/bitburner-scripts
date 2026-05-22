/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.clearLog();

  const allPrograms = ["BruteSSH.exe", "relaySMTP.exe", "SQLInject.exe", "HTTPWorm.exe", "FTPCrack.exe"];
  const hackablePorts = getPrograms(ns, allPrograms);

  var foundServers = getServers(ns);

  for (var i = 0; i < foundServers.length; i++) {
    if (canNuke(ns, foundServers[i], hackablePorts)) {
      nukePorts(ns, foundServers[i], hackablePorts);
      ns.nuke(foundServers[i]);
      ns.printf("Succesfully gained ROOT access to '%s'.", foundServers[i]);
    }
  }

  ns.toast("Finished nuking all eligible servers.", 'success', 2500);
}

/** @param {NS} ns */
function getServers(ns) {
  var allServers = searchChildren(ns, 'home', []);
  allServers.filter((item, index) => allServers.indexOf(item) === index);
  return allServers;
}

/** @param {NS} ns 
 *  @param {string} hostname 
 *  @param {string[]} collectedServers */
function searchChildren(ns, hostname, collectedServers) {
  var children = ns.scan(hostname);
  for (var i = 0; i < children.length; i++) {
    if (children[i] == hostname) continue;
    if (collectedServers.includes(children[i])) continue;

    collectedServers.push(children[i]);
    searchChildren(ns, children[i], collectedServers);
  }
  return collectedServers;
}

/** @param {NS} ns 
 *  @param {string} hostname
 *  @param {string[]} ownedPrograms */
function canNuke(ns, hostname, ownedPrograms) {
  var nukingPossible = true;
  if (ns.hasRootAccess(hostname)) {
    ns.printf("Already have ROOT access to '%s'.", hostname)
    nukingPossible = false;
  }

  const portCountRequired = ns.getServerNumPortsRequired(hostname);
  if (portCountRequired > ownedPrograms.length) {
    ns.printf("Hostname '%s' requires more open ports. (%d/%d)", hostname, ownedPrograms.length, portCountRequired);
    nukingPossible = false;
  }
  return nukingPossible;
}

/** @param {NS} ns 
 *  @param {string} hostname 
 *  @param {string[]} ownedPrograms */
function nukePorts(ns, hostname, ownedPrograms) {
  const scriptName = ns.getScriptName();
  var scriptRam = ns.getScriptRam(scriptName);
  for (var i = 0; i < ownedPrograms.length; i++) {
    const program = ownedPrograms[i].toLowerCase().replace(".exe", "");

    const programRamCost = ns.getFunctionRamCost(program);
    scriptRam = ns.ramOverride(scriptRam + programRamCost);
    ns[program](hostname);
    // scriptRam = ns.ramOverride(scriptRam - programRamCost);
    // currently produces RAM bug, hopefully a proper fix can be found in the future.

  }
  ns.ramOverride(scriptRam);
}

/** @param {NS} ns 
 *  @param {string[]} allPrograms */
function getPrograms(ns, allPrograms) {
  var programsOwned = [];
  for (var i = 0; i < allPrograms.length; i++) {
    if (ns.fileExists(allPrograms[i], 'home')) {
      programsOwned.push(allPrograms[i]);
    }
  }
  return programsOwned;
}
