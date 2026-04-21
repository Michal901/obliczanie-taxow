let historiaProduktow = [];
let arkuszIndex = 1;
let trybSumowania = false;
let obliczonyJuzRaz = false; // flaga czy już obliczono dla aktualnego tekstu
 
// --- Pomocnicze ---
function pobierzMnoznik() {
  const val = parseInt(document.getElementById("multiplier").value);
  if (!val || val < 1) return 1;
  return val;
}
 
// --- Obliczanie wagi ---
function obliczWage() {
  const text = document.getElementById("inputText").value.trim();
  if (!text) return;
 
  const multiplier = pobierzMnoznik();
  const lines = text.split("\n");
 
  let totalX1 = 0;
  let totalXN = 0;
  let output = "";
  let tableRows = "";
  let i = 1;
  let tymczasowaHistoria = [];
  let czySaBledy = false;
 
  document.getElementById("output").style.display = "block";
  document.getElementsByClassName("tytul-wyniki")[0].style.display = "block";
 
  for (const line of lines) {
    if (!line.trim()) continue;
 
    const matches = [...line.matchAll(/(-?\d+[.,]?\d*)\s*(?=kg)/gi)];
    const weightMatch = matches.length ? matches[matches.length - 1] : null;
    const quantityMatch = line.match(/(\d+[.,]?\d*)\s*$/);
 
    if (weightMatch && quantityMatch) {
      const weight = parseFloat(weightMatch[0].replace(",", "."));
      const quantity = parseFloat(quantityMatch[0].replace(",", "."));
 
      if (weight <= 0) {
        output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: waga ≤ 0</div>`;
        czySaBledy = true;
        continue;
      }
      if (quantity <= 0) {
        output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: ilość ≤ 0</div>`;
        czySaBledy = true;
        continue;
      }
 
      const adjustedQuantity = quantity * multiplier;
      const lineTotalX1 = weight * quantity;
      const lineTotalXN = weight * adjustedQuantity;
 
      totalX1 += lineTotalX1;
      totalXN += lineTotalXN;
 
      tymczasowaHistoria.push({
        nazwa: line
          .replace(/(\d+[.,]?\d*\s*kg)/gi, "")
          .replace(/(\d+[.,]?\d*)\s*$/, "")
          .trim(),
        ilosc: adjustedQuantity,
        waga: weight,
      });
 
      // Pokaż x1 zawsze, mnożnik tylko gdy > 1
      const mnoznikInfo =
        multiplier > 1
          ? `${quantity} × ${multiplier} = <strong>${adjustedQuantity}</strong> × ${weight} kg = <strong>${lineTotalXN.toFixed(2)} kg</strong>`
          : `${quantity} × ${weight} kg = <strong>${lineTotalX1.toFixed(2)} kg</strong>`;
 
      output += `<div class="wynik-linia poprawne">
  <p class="wynik-nazwa">${line.trim()}</p>
  <p class="wynik-mnozenie">
    <img src="src/arrow-right.png" alt="" style="width: 30px;">
    ${mnoznikInfo}
  </p>
</div>`;
 
      tableRows += `
        <tr>
          <td><input type="checkbox"></td>
          <td>${i++}.</td>
          <td>${line.trim()}</td>
          <td style="text-align: center;"><strong>${adjustedQuantity}</strong></td>
          <td>${weight}</td>
          <td>${lineTotalXN.toFixed(2)}</td>
        </tr>`;
    } else {
      output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: nie rozpoznano wagi lub ilości</div>`;
      czySaBledy = true;
    }
  }
 
  if (czySaBledy) {
    output += `<div id="popupError" class="popup-error">Popraw błędy – produkty nie zostały dodane.</div>`;
    document.getElementById("output").innerHTML = output;
    setTimeout(() => {
      const popup = document.getElementById("popupError");
      if (popup) popup.remove();
    }, 3000);
    return;
  }
 
  // Dodaj do historii tylko jeśli to nowe obliczenie (nie ponowne kliknięcie)
  historiaProduktow.push(...tymczasowaHistoria);
  obliczonyJuzRaz = true;
 
  const podsumowanie =
    multiplier > 1
      ? `Łączna waga (x1): ${totalX1.toFixed(2)} kg &nbsp;|&nbsp; Łączna waga (x${multiplier}): <strong>${totalXN.toFixed(2)} kg</strong>`
      : `Łączna waga: <strong>${totalX1.toFixed(2)} kg</strong>`;
 
  output += `<div class="podsumowanie">${podsumowanie}</div>`;
  document.getElementById("output").innerHTML = output;
 
  document.getElementById("printTable").innerHTML = `
  <table>
    <thead>
      <tr>
        <th style="text-align: center;"><img src="src/check.png" alt="" style="width: 15px;"></th>
        <th>L.p.</th>
        <th>Produkt</th>
        <th>Ilość${multiplier > 1 ? ` (×${multiplier})` : ""}</th>
        <th>Waga jednostkowa (kg)</th>
        <th>Waga całkowita (kg)</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align: right;"><strong>Łączna waga:</strong></td>
        <td><strong>${totalXN.toFixed(2)} kg</strong></td>
      </tr>
    </tfoot>
  </table>`;
}
 
// --- Odblokowanie ponownego obliczenia po zmianie tekstu lub mnożnika ---
document.getElementById("inputText").addEventListener("input", () => {
  obliczonyJuzRaz = false;
  trybSumowania = false;
});
 
document.getElementById("multiplier").addEventListener("input", () => {
  // Walidacja: nie pozwól na 0 ani ujemne
  const input = document.getElementById("multiplier");
  if (parseInt(input.value) < 1 || isNaN(parseInt(input.value))) {
    input.value = 1;
  }
  obliczonyJuzRaz = false;
});
 
// --- Sumowanie produktów z historii ---
function sumujProdukty() {
  if (historiaProduktow.length === 0) {
    document.getElementById("output").innerHTML =
      "<p style='color:orange;'>Brak danych w historii. Najpierw oblicz wagę.</p>";
    return;
  }
 
  trybSumowania = true;
  const produkty = {};
 
  for (const item of historiaProduktow) {
    const key = item.nazwa.toLowerCase();
    if (!produkty[key]) {
      produkty[key] = { name: item.nazwa, quantity: 0, weight: item.waga };
    }
    produkty[key].quantity += item.ilosc;
  }
 
  const produktyPosortowane = Object.values(produkty).sort(
    (a, b) => b.weight * b.quantity - a.weight * a.quantity
  );
 
  let index = 1;
  let total = 0;
  let tbody = "";
 
  for (const item of produktyPosortowane) {
    const lineTotal = item.weight * item.quantity;
    total += lineTotal;
    tbody += `
      <tr>
        <td><input type="checkbox"></td>
        <td style="text-align: center;">${index++}.</td>
        <td>${item.name}</td>
        <td><strong>${item.quantity}</strong></td>
        <td>${item.weight}</td>
        <td><strong>${lineTotal.toFixed(2)}</strong></td>
      </tr>`;
  }
 
  const zbiorczaTabela = `
    <h3 class="tytul-wyniki-zbiorcze">Zbiorcze podsumowanie produktów:</h3>
    <table class="wyniki-zbiorcze">
      <thead>
        <tr>
          <th style="text-align: center;"><img src="src/check.png" alt="" style="width: 15px;"></th>
          <th>L.p.</th>
          <th>Nazwa produktu</th>
          <th>Ilość</th>
          <th>Waga jednostkowa (kg)</th>
          <th>Waga łączna (kg)</th>
        </tr>
      </thead>
      <tbody>${tbody}</tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align: right;"><strong>Łączna waga:</strong></td>
          <td><strong>${total.toFixed(2)} kg</strong></td>
        </tr>
      </tfoot>
    </table>`;
 
  document.getElementById("output").innerHTML = zbiorczaTabela;
  document.getElementById("printTable").innerHTML = zbiorczaTabela;
}
 
// --- Drukowanie ---
function drukujWyniki() {
  const tabela = document.getElementById("printTable");
  const outputEl = document.getElementById("output");
 
  if (!outputEl.innerHTML.trim() || !tabela.innerHTML.trim()) {
    alert("Brak wyników do druku. Najpierw oblicz wagę.");
    return;
  }
 
  tabela.style.display = "block";
 
  if (!trybSumowania) {
    const naglowek = document.createElement("h2");
    naglowek.className = "tytul-arkusza";
    naglowek.textContent = `Arkusz ${arkuszIndex++}`;
    tabela.insertBefore(naglowek, tabela.firstChild);
  }
 
  window.print();
  tabela.style.display = "none";
}
 
// --- Czyszczenie historii ---
function wyczyscHistorie() {
  historiaProduktow = [];
  trybSumowania = false;
  obliczonyJuzRaz = false;
  arkuszIndex = 1;
  document.getElementById("output").innerHTML = "";
  document.getElementById("output").style.display = "none";
  document.getElementsByClassName("tytul-wyniki")[0].style.display = "none";
  document.getElementById("printTable").innerHTML = "";
  document.getElementById("inputText").value = "";
  document.getElementById("multiplier").value = 1;
}