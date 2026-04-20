# Sdílené Malování v Reálném Čase

Tato aplikace umožňuje více uživatelům malovat společně na jednom plátně v reálném čase s designem inspirovaným Microsoft Paint.

## Design

Aplikace má klasický Windows 95/98 styl podobný Microsoft Paint:
- **Title bar**: S ovládacími tlačítky (minimalizovat, maximalizovat, zavřít)
- **Menu bar**: Klasické menu (Soubor, Úpravy, Zobrazení, atd.)
- **Toolbar**: Vertikální lišta s nástroji vlevo
- **Canvas**: Hlavní pracovní oblast uprostřed
- **Color palette**: Paleta barev dole s předvolbami (28 barev včetně základních Windows barev)
- **Status bar**: Informace o počtu připojených uživatelů

Rozložení je plně responzivní a připomíná klasický MS Paint z Windows 95/98.

## Funkce

- **Reálný čas**: Všechny změny se okamžitě synchronizují mezi všemi připojenými uživateli
- **Výběr barev**: Plně přizpůsobitelné pomocí color pickeru nebo předvoleb
- **Předvolby barev**: 8 předdefinovaných barev pro rychlý výběr
- **Velikost štětce**: Nastavitelná velikost štětce od 1 do 50 pixelů
- **Nástroje**: Štětec a guma pro kreslení/mazání
- **Tvary štětce**: Kruh a čtverec
- **Zoom**: Přiblížení/oddálení pomocí tlačítek nebo kolečka myši
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
2. Při kreslení se odesílají souřadnice, barva, velikost, tvar a typ nástroje na server
3. Server broadcastuje tyto údaje všem ostatním připojeným klientům
4. Klienti přijímají data a vykreslují tvary na svém plátně

## Ovládání

- **Kreslení**: Klikněte a táhněte myší nebo prstem na canvas
- **Nástroje**: Vyberte štětec nebo gumu z levé lišty
- **Barva**: Klikněte na barevnou předvolbu dole nebo použijte color picker
- **Velikost**: Nastavte pomocí posuvníku v paletě barev
- **Tvary**: Vyberte kruh nebo čtverec v paletě barev
- **Zoom**: Použijte tlačítka +/- nebo kolečko myši
- **Vymazání**: Klikněte na tlačítko "Vymazat" v paletě barev
- **Menu**: Klikněte na položky v horním menu (aktuálně dekorativní)

## Licenze

MIT