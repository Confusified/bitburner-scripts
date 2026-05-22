/** @param {NS} ns */
export async function main(ns) {
  /*
  As a rule of thumb, your hacking target should be the Server
  that has the highest ratio of MaxMoney / MinimumSecurityLevel 
  and its RequiredHackingLevel is under half of your hacking level.
  */
  ns.ui.openTail();
  ns.disableLog("ALL");

  const hackingLevel = ns.getHackingLevel();

  var servers = getServers(ns);
  var mostOptimalValue = 0;
  var mostOptimalServer = null;

  for (var i = 0; i < servers.length; i++) {
    var moneySecurityRatio = (ns.getServerMaxMoney(servers[i]) / ns.getServerMinSecurityLevel(servers[i]))
    var serverHackLvlReq = ns.getServerRequiredHackingLevel(servers[i]);
    var hackingLevelRatio = ((hackingLevel / 2) / serverHackLvlReq)
    var finalRatio = (moneySecurityRatio / hackingLevelRatio);
    if (serverHackLvlReq > hackingLevel) {
      ns.printf("Cannot hack '%s': Not high enough hacking level.", servers[i])
      continue
    }
    else if (!ns.hasRootAccess(servers[i])) {
      ns.printf("Cannot hack '%s': No root access.", servers[i])
      continue
    }

    if (finalRatio > mostOptimalValue) {
      mostOptimalValue = finalRatio;
      mostOptimalServer = servers[i];
    }
    ns.printf("%s: %.2f (%.2f / %.2f)", servers[i], finalRatio, moneySecurityRatio, hackingLevelRatio);
  }
  ns.printf("Most optimal: %s, %.2f ", mostOptimalServer, mostOptimalValue)
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
