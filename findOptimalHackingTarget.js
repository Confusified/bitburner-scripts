/** @param {NS} ns */
export async function main(ns) {
  /*
  As a rule of thumb, your hacking target should be the Server
  that has the highest ratio of MaxMoney / MinimumSecurityLevel 
  and its RequiredHackingLevel is under half of your hacking level.
  
  This rule of thumb does not account for 'traps' with terrible grow rates, such as 'foodnstuff'.
  */
  ns.ui.openTail();
  ns.disableLog("ALL")

  const hackingLevel = ns.getHackingLevel();
  const serverBlacklist = ["n00dles", "foodnstuff"];

  var servers = getServers(ns);
  var mostOptimalValue = 0;
  var mostOptimalServer = null;

  for (var i = 0; i < servers.length; i++) {
    var maxServerMoney = ns.getServerMaxMoney(servers[i]);
    var moneySecurityRatio = (maxServerMoney / ns.getServerMinSecurityLevel(servers[i]))

    var serverHackLvlReq = ns.getServerRequiredHackingLevel(servers[i]);
    var hackingLevelRatio = (serverHackLvlReq / (hackingLevel / 2))
    var growRatio = (ns.getServerGrowth(servers[i]) / 10);


    var finalRatio = ((maxServerMoney / moneySecurityRatio) / hackingLevelRatio) * growRatio;

    if (serverHackLvlReq > hackingLevel) {
      // ns.printf("Cannot hack '%s': Not high enough hacking level for server.", servers[i]);
      continue
    }
    else if (!ns.hasRootAccess(servers[i])) {
      // ns.printf("Cannot hack '%s': No root access to server.", servers[i]);
      continue
    }
    else if (serverBlacklist.includes(servers[i])) {
      // ns.printf("Cannot hack '%s': Server is blacklisted.", servers[i]);
      continue
    }
    else if (ns.getServer(servers[i]).purchasedByPlayer) {
      // ns.printf("Cannot hack '%s': Server owned by player.", servers[i]);
      continue
    }
    else if (maxServerMoney == 0) {
      // ns.printf("Cannot hack '%s': Server cannot have any money.", servers[i]);
      continue
    }

    if (finalRatio > mostOptimalValue) {
      mostOptimalValue = finalRatio;
      mostOptimalServer = servers[i];
    }
    ns.printf("%s: %d (((%d / %d) / %.3f) * %.2f)", servers[i], finalRatio, maxServerMoney, moneySecurityRatio, hackingLevelRatio, growRatio);
  }
  ns.printf("Most optimal: %s, %d", mostOptimalServer, mostOptimalValue)
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
