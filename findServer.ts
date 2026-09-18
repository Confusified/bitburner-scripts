export async function main(ns: NS) {
  if (ns.args[0] === null) {
    ns.toast("Must provide hostname.", 'error', 3000);
    return;
  }
  let targetServer: string = ns.args[0].toString();


  let servers: string[] = reversePathSearch(ns, targetServer);
  const connectString = servers
    .map((server) => `connect ${server}`)
    .join(";");
  ns.tprintf("Path to '%s':\n" + connectString, ns.args[0])
  const doCopyPath = await ns.prompt("Copy to clipboard?", { type: "boolean" });
  if (doCopyPath || ns.args[1] === true) await navigator.clipboard.writeText(connectString);
}

function reversePathSearch(ns: NS, hostname: string): string[] {
  let foundServers: string[] = [hostname];
  while (foundServers[0] !== "home") {
  const scannedServers = ns.scan(foundServers[0]);
  foundServers.unshift(scannedServers[0]);
}
  return foundServers;
}