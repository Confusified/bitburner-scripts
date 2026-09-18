/** @param {NS} ns */
export function main(ns) {
  ns.ui.openTail();
  ns.disableLog("ALL");
  ns.print("Can't run module script.");
}
/** @param {NS} ns 
 *  @returns {string[]} An array containing all servers on the network
*/
export function getServers(ns) {
  var servers = new Set(["home"]);
  servers.forEach(n => ns.scan(n).forEach(name => servers.add(name))
  );
  return Array.from(servers);
}

/** @param {NS} ns
 *  @param {number} self_pid The PID of the script that needs the results
 *  @param {string} method_name The name of the method you want to execute e.g. ns.getHackingLevel
 *  @param {any[]} method_args The arguments that the method requires
 *  @returns {Promise<any>} The results of the given method
 *  @remarks Method names must be without the `ns.` prefix. This method must be `await`ed
 */
export async function callProxy(ns, self_pid, method_name, ...method_args) {
  const port_handle = ns.getPortHandle(self_pid);
  port_handle.clear();
  var host_server = getHostingServer(ns, method_name);
  if (host_server === undefined) return "FAILURE TO RUN DODGE SCRIPT! REASON: Not enough RAM available on any server."
  var dodge_script_name = "ram/dodge_script.js";
  ns.scp(dodge_script_name, host_server, "home");
  var proxy_pid = ns.exec(dodge_script_name, host_server, { temporary: true, threads: 1 }, self_pid, method_name, ...method_args);
  if (proxy_pid === 0) return "FAILURE TO RUN DODGE SCRIPT! REASON: Failed while attempting to run script.";
  await port_handle.nextWrite();
  var result = port_handle.read();
  try {
    result = JSON.parse(result)[0];
  }
  catch { }
  return result;
}

/** Finds a suitable server to run the ram dodge script on, tries to avoid using `home`
 *  @param {NS} ns 
 *  @param {string} method_name The name of the method you want to execute e.g. ns.getHackingLevel
 *  @returns {string | undefined} A server that can host the given method
 *  @remarks Made to be used with the callProxy function
 */
function getHostingServer(ns, method_name) {
  var eligible_servers = getServers(ns).filter(srv => ns.hasRootAccess(srv)).reverse();
  for (var i = 0; i < eligible_servers.length; i++) {
    var server = eligible_servers[i];
    var available_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    var required_ram = ns.getFunctionRamCost(method_name) + 1.6; // ns.getScriptRam("ram/dodge_script.js", "home")
    if (available_ram < required_ram) continue;
    // ns.print(`Dodge script is being hosted on: ${server} `);
    return server;
  }
  return undefined;
}


