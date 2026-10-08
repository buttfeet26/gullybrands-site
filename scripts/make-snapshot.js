/* Rebuilds snapshot.js from live Shopify: node scripts/make-snapshot.js shopify.js snapshot.js */
const fs = require("fs"), vm = require("vm");
const [src, out] = process.argv.slice(2);
const code = fs.readFileSync(src, "utf8") + "\n;globalThis.__run = async () => buildProducts(await fetchShopify());";
const ctx = vm.createContext({ fetch, console });
vm.runInContext(code, ctx);
ctx.__run().then(list => {
  const body = "/* Snapshot of the live Shopify catalogue, used ONLY if Shopify can't be reached.\n" +
    "   Regenerate whenever products/colours change (see README note in shopify.js). */\n" +
    "const FALLBACK = " + JSON.stringify(list.map(({ isNew, ...p }) => p)) + ";\n";
  fs.writeFileSync(out, body);
  console.log("products", list.length, "bytes", body.length);
});
