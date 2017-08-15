function now() {
  return Date.now();
}

function log(str) {
  console.log(`${now()}: ${str}`);
}

function sleep(n) {
  let start = Date.now();
  while (Date.now() - start < n) {
  }
}

function sleep_5000(name) {
  log(`${name} sleep 5000ms start`);
  sleep(5000);
  log(`${name} sleep 5000ms end`)
}

export {now, log, sleep, sleep_5000}