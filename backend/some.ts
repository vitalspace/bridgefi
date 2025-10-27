// Obtener transacciones de una dirección
const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const url = `https://api.mainnet.hiro.so/extended/v1/address/${address}/transactions?limit=1&offset=0`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    // Obtener el total de transacciones
    const total = data.total;
    
    // Para obtener la primera transacción, necesitas calcular el offset
    const firstTxUrl = `https://api.mainnet.hiro.so/extended/v1/address/${address}/transactions?limit=1&offset=${total - 1}`;
    
    return fetch(firstTxUrl);
  })
  .then(response => response.json())
  .then(data => {
    const firstTx = data.results[0];
    const timestamp = firstTx.burn_block_time;
    const creationDate = new Date(timestamp * 1000);
    const today = new Date();
    const daysOld = Math.floor((today - creationDate) / (1000 * 60 * 60 * 24));
    
    console.log(`La wallet tiene ${daysOld} días de vida`);
  });