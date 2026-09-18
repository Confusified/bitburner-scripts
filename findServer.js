/** @param {NS} ns */
export async function main(ns) {
  if (ns.args[0] == null) {
    ns.toast("Must provide hostname.", 'error', 3000);
    return;
  }

  var path = await reversePathSearch(ns, ns.args[0].toString(), [ns.args[0].toString()]);
  var connectString = "";
  for (var i = 0; i < path.length; i++) {
    if (i == 0) connectString = path[i];
    else connectString = connectString + ";connect " + path[i];
  }
  ns.tprintf("Path to '%s':\n" + connectString, ns.args[0])
  const doCopyPath = await ns.prompt("Copy to clipboard?", { type: "boolean" });
  if (doCopyPath || ns.args[1] === true) await navigator.clipboard.writeText(connectString);
}

/** @param {NS} ns
 * @param {string} hostname
 * @param {string[]} prevPath */
async function reversePathSearch(ns, hostname, prevPath) {
  const foundServers = ns.scan(hostname)
  const parentServer = foundServers[0];
  prevPath.push(parentServer);
  if (parentServer == "home") {
    prevPath.reverse();
    return prevPath;
  }
  const finalPath = await reversePathSearch(ns, parentServer, prevPath)
  return finalPath;
}