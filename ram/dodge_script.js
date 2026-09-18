/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length < 2) return ns.tprint("Not enough arguments provided. Must provide requester PID and method name.");
  var requester = ns.args.shift(); // ns.args[0] = pid
  var method = ns.args.shift(); // ns.args[1] = method
  // rest is args for method
  ns.ramOverride(1.6 + ns.getFunctionRamCost("" + method));
  var result
  try {
    result = eval("ns." + method)(...ns.args);
    // ns.tprint(result);
    // ns.tprint(`Called method: ns.${method}(${ns.args.reduce((final, q) => final + ',' + q, '').substring(1)})`)
    if (result instanceof Promise) result = await result;
    result = JSON.stringify([result])
    // ns.tprint(result)

  }
  catch { }
  ns.atExit(() => ns.writePort(Number(requester), result));
}