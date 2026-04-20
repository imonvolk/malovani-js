# Sdílené Malování v Reálném Čase

Tato aplikace umožňuje více uživatelům malovat společně na jednom plátně v reálném čase pomocí Node.js, Express a Socket.IO.

## Funkce

- **Reálný čas**: Všechny změny se okamžitě synchronizují mezi všemi připojenými uživateli
- **Výběr barev**: Uživatelé mohou měnit barvu štětce
- **Velikost štětce**: Nastavitelná velikost štětce od 1 do 50 pixelů
- **Vymazání plátna**: Tlačítko pro vymazání celého plátna pro všechny uživatele
- **Podpora dotykových zařízení**: Funguje na počítačích i mobilních zařízeních

## Jak spustit

1. Ujistěte se, že máte nainstalovaný Node.js (verze 14 nebo vyšší)

2. Nainstalujte závislosti:
   ```
   npm install
   ```

3. Spusťte server:
   ```
   npm start
   ```

4. Otevřete prohlížeč a přejděte na `http://localhost:3000`

## Vývoj

Pro vývoj s automatickým restartováním serveru použijte:
```
npm run dev
```

## Technologie

- **Backend**: Node.js s Express
- **Real-time komunikace**: Socket.IO
- **Frontend**: Vanilla JavaScript s HTML5 Canvas

## Architektura

- `server.js`: Hlavní server soubor s Express a Socket.IO
- `public/index.html`: HTML rozhraní
- `public/script.js`: Klientský JavaScript pro kreslení a komunikaci
- `package.json`: Závislosti a skripty

## Jak to funguje

1. Uživatel se připojí k serveru přes WebSocket
2. Při kreslení se odesílají souřadnice a vlastnosti štětce na server
3. Server broadcastuje tyto údaje všem ostatním připojeným klientům
4. Klienti přijímají data a vykreslují čáry na svém plátně

## Licenze

MIT