import {callProxy, getServers} from "util/server_module.js";

/** @param {NS} ns */
export async function main(ns) {
  var self_pid = ns.self().pid;
  var method_name = ns.args.shift() ?? "getHackingLevel";
  var method_args = ns.args;
  var start = performance.now();
  var result = await callProxy(ns, self_pid, method_name.toString(), ...method_args);
  var end = performance.now();
  ns.tprint("Result: ", result);
  ns.tprint("Time taken: ", ((end - start) / 1000).toFixed(3), "s");
}