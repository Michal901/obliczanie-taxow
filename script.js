let historiaProduktow = [];
let arkuszIndex = 1;
let trybSumowania = false;

// Funkcja obliczająca wagę – wyświetla zawsze x1
function obliczWage() {
  const text = document.getElementById("inputText").value;
  const lines = text.split("\n");
  const button = document.getElementsByClassName("btn-waga")[0];
  const multiplier = parseInt(document.getElementById("multiplier").value) || 1;

  let total = 0; // do wyświetlenia x1
  let output = "";
  let tableRows = "";
  let i = 1;
  let tymczasowaHistoria = [];
  let czySaBledy = false;

  document.getElementById("output").style.display = "block";
  document.getElementsByClassName("tytul-wyniki")[0].style.display = "block";

  if (button) button.disabled = true;

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
      } else if (quantity <= 0) {
        output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: ilość ≤ 0</div>`;
        czySaBledy = true;
      } else {
        // do historii zapisujemy z mnożnikiem
        const adjustedQuantity = quantity * multiplier;
        tymczasowaHistoria.push({
          nazwa: line.replace(/(\d+[.,]?\d*\s*kg)/gi, "").replace(/(\d+[.,]?\d*)\s*$/, "").trim(),
          ilosc: adjustedQuantity,
          waga: weight,
        });

        // do output x1
        const lineTotal = weight * quantity;
        total += lineTotal;

        output += `<div class="wynik-linia poprawne">
  <p class="wynik-nazwa">${line.trim()}</p>
  <p class="wynik-mnozenie">
    <img src="src/arrow-right.png" alt="" style="width: 30px;">
    ${quantity} × 1 = ${quantity} × ${weight} kg = <strong>${lineTotal.toFixed(2)} kg</strong>
  </p>
</div>`;

        tableRows += `
          <tr>
            <td></td>
            <td>${i++}.</td>
            <td>${line.trim()}</td>
            <td style="text-align: center;"><strong>${quantity}</strong></td>
            <td>${weight}</td>
            <td>${lineTotal.toFixed(2)}</td>
          </tr>`;
      }
    } else {
      output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: nie rozpoznano wagi lub ilości</div>`;
      czySaBledy = true;
    }
  }

  if (czySaBledy) {
    output += `<div id="popupError" class="popup-error">Nie dodano produktów – popraw błędy poniżej.</div>`;
    document.getElementById("output").innerHTML = output;
    setTimeout(() => { const popup = document.getElementById("popupError"); if (popup) popup.remove(); }, 3000);
    return;
  }

  historiaProduktow.push(...tymczasowaHistoria);

  output += `<div class="podsumowanie">
    <strong>Łączna waga (x1): ${total.toFixed(2)} kg</strong></div>`;

  document.getElementById("output").innerHTML = output;

  // tabela do drukowania – jeszcze x1 nie używamy tutaj
  document.getElementById("printTable").innerHTML = `
  <table>
    <thead>
      <tr>
        <th style="text-align: center;"><img src="src/check.png" alt="" style="width: 15px;"></th>
        <th>l.p.</th>
        <th>Produkt</th>
        <th>Ilość</th>
        <th>Waga pojedyncza (kg)</th>
        <th>Waga całkowita (kg)</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align: right;"><strong>Łączna waga:</strong></td>
        <td><strong>${total.toFixed(2)} kg</strong></td>
      </tr>
    </tfoot>
  </table>`;
}

// Odblokowanie przycisku przy zmianie tekstu
document.getElementById("inputText").addEventListener("input", () => {
  const button = document.getElementsByClassName("btn-waga")[0];
  if (button) button.disabled = false;
});

// Sumowanie produktów w historii – uwzględnia mnożnik
function sumujProdukty() {
  trybSumowania = true;
  const produkty = {};

  for (const item of historiaProduktow) {
    const key = item.nazwa.toLowerCase();
    if (!produkty[key]) {
      produkty[key] = { name: item.nazwa, quantity: 0, weight: item.waga };
    }
    produkty[key].quantity += item.ilosc; // tu już mnożnik jest
  }

  const produktyPosortowane = Object.values(produkty).sort((a, b) => b.weight * b.quantity - a.weight * a.quantity);

  let zbiorczaTabela = `
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
      <tbody>`;

  let index = 1;
  let total = 0;

  for (const item of produktyPosortowane) {
    const lineTotal = item.weight * item.quantity;
    total += lineTotal;

    zbiorczaTabela += `
      <tr>
        <td></td>
        <td style="text-align: center;">${index++}.</td>
        <td>${item.name}</td>
        <td><strong>${item.quantity}</strong></td>
        <td>${item.weight}</td>
        <td><strong>${lineTotal.toFixed(2)}</strong></td>
      </tr>`;
  }

  zbiorczaTabela += `
      </tbody>
      <tfoot>
       
      </tfoot>
    </table>`;

  document.getElementById("output").innerHTML = zbiorczaTabela;
  document.getElementById("printTable").innerHTML = zbiorczaTabela;
}

// Drukowanie wyników – uwzględnia sumowanie/mnożnik
function drukujWyniki() {
  const tabela = document.getElementById("printTable");
  if (document.getElementById("inputText").value === "" || document.getElementById("output").innerHTML === "") return;

  tabela.style.display = "block";

  if (!trybSumowania) {
    const naglowek = document.createElement("h2");
    naglowek.className = "tytul-arkusza";
    naglowek.textContent = `${arkuszIndex++}`;
    tabela.insertBefore(naglowek, tabela.firstChild);
  }

  window.print();
  tabela.style.display = "none";
}

// Czyszczenie historii
function wyczyscHistorie() {
  historiaProduktow = [];
  trybSumowania = false;
  document.getElementById("output").innerHTML = "<p>Historia wyczyszczona.</p>";
  document.getElementById("printTable").innerHTML = "";
  document.getElementById("inputText").value = "";
  arkuszIndex = 1;
}
