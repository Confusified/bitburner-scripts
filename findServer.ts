import {reversePathSearch} from "util/server_module.ts";

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
  ns.tprintf("Path to '%s':\n" + connectString, ns.args[0]);

  const doCopyPath = ns.args[1] as boolean === true ? true : await ns.prompt("Copy to clipboard?", { type: "boolean" });
  if (doCopyPath) await navigator.clipboard.writeText(connectString);
}

