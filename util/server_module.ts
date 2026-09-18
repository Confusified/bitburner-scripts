export function main(ns: NS) {
  ns.ui.openTail();
  ns.disableLog("ALL");
  ns.print("Can't run module script.");
}

/** 
 *  @param ns
 *  @returns Returns an array of all servers in the game, starting with "home"
 */
export function getServers(ns: NS): string[] {
  var servers: Set<string> = new Set(["home"]);
  servers.forEach(n => ns.scan(n).forEach(name => servers.add(name))
  );
  return Array.from(servers);
}

/** 
 *  @param self_pid The PID of the script that needs the results
 *  @param method_name The name of the method you want to execute e.g. ns.getHackingLevel
 *  @param method_args The arguments that the method requires
 *  @returns The results of the given method
 *  @remarks Method names must be without the `ns.` prefix. This method must be `await`ed
 */
export async function callProxy(ns: NS, self_pid: number, method_name: string, ...method_args: any[]): Promise<any> {
  const port_handle: NetscriptPort = ns.getPortHandle(self_pid);
  port_handle.clear();
  var host_server: string | undefined = getHostingServer(ns, method_name);
  if (host_server === undefined) return "FAILURE TO RUN DODGE SCRIPT! REASON: Not enough RAM available on any server."
  var dodge_script_name: string = "ram/dodge_script.js";
  ns.scp(dodge_script_name, host_server, "home");
  var proxy_pid: number = ns.exec(dodge_script_name, host_server, { temporary: true, threads: 1 }, self_pid, method_name, ...method_args);
  if (proxy_pid === 0) return "FAILURE TO RUN DODGE SCRIPT! REASON: Failed while attempting to run script.";
  await port_handle.nextWrite();
  var result: any = port_handle.read();
  try {
    result = JSON.parse(result)[0];
  }
  catch { }
  return result;
}

/** Finds a suitable server to run the ram dodge script on, tries to avoid using `home`
 *  @param ns 
 *  @param method_name The name of the method you want to execute e.g. ns.getHackingLevel
 *  @returns A server that can host the given method
 *  @remarks Made to be used with the callProxy function
 */
function getHostingServer(ns: NS, method_name: string): string | undefined {
  var eligible_servers: string[] = getServers(ns).filter(srv => ns.hasRootAccess(srv)).reverse();
  for (var i = 0; i < eligible_servers.length; i++) {
    var server: string = eligible_servers[i];
    var available_ram: number = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    var required_ram: number = ns.getFunctionRamCost(method_name) + 1.6; // ns.getScriptRam("ram/dodge_script.js", "home")
    if (available_ram < required_ram) continue;
    // ns.print(`Dodge script is being hosted on: ${server} `);
    return server;
  }
  return undefined;
}

/** 
 *  @param ns 
 *  @param hostname The name of the server you want to find the path to
 *  @returns An array of servers that lead to the target server, starting from home and ending with the target server
 */
export function reversePathSearch(ns: NS, hostname: string): string[] {
  let foundServers: string[] = [hostname];
  while (foundServers[0] !== "home") {
  const scannedServers = ns.scan(foundServers[0]);
  foundServers.unshift(scannedServers[0]);
}
  return foundServers;
}