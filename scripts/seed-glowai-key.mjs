const ws = new WebSocket(process.env.GLOWAI_WS);
const key = process.env.GLOWAI_KEY;
let nextId = 1;

ws.addEventListener('open', () => {
  const expression = `localStorage.setItem('glowai_apikey', ${JSON.stringify(key)}); Boolean(localStorage.getItem('glowai_apikey') && localStorage.getItem('glowai_apikey').startsWith('sk-ant-'))`;
  ws.send(JSON.stringify({
    id: nextId++,
    method: 'Runtime.evaluate',
    params: { expression, returnByValue: true },
  }));
});

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id === 1) {
    const ok = msg.result?.result?.value === true;
    console.log(ok ? 'KEY_SEEDED' : 'KEY_SEED_FAILED');
    ws.close();
    process.exit(ok ? 0 : 1);
  }
});

setTimeout(() => {
  console.log('KEY_SEED_TIMEOUT');
  process.exit(1);
}, 5000);
