function obliczWage() {
  const text = document.getElementById("inputText").value;
  const lines = text.split("\n");
  let total = 0;
  let output = "";
  let tableRows = "";

  for (const line of lines) {
    if (!line.trim()) continue;

    const matches = [...line.matchAll(/(-?\d+[.,]?\d*)\s*(?=kg)/gi)];
    const weightMatch = matches.length ? matches[matches.length - 1] : null;
    const quantityMatch = line.match(/(\d+[.,]?\d*)\s*$/);

    if (weightMatch && quantityMatch) {
      const weight = parseFloat(weightMatch[0].replace(",", "."));
      const quantity = parseFloat(quantityMatch[0].replace(",", "."));

      if (weight <= 0) {
        output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: waga ≤ 0 (błędna wartość)</div>`;
      } else if (quantity <= 0) {
        output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: ilość ≤ 0 (błędna wartość)</div>`;
      } else {
        const lineTotal = weight * quantity;
        total += lineTotal;
        output += `<div class="wynik-linia poprawne"><p class="wynik-nazwa">${line.trim()}</p><p class="wynik-mnozenie"><img src="src/arrow-right.png" alt="" style="width: 30px;"> ${quantity} × ${weight} kg = <strong>${lineTotal.toFixed(
          2
        )} kg</strong></p></div>`;

        tableRows += `
        <tr>
          <td> </td>
          <td>${line.trim()}</td>
          <td>${quantity}</td>
          <td>${weight}</td>
          <td>${lineTotal.toFixed(2)}</td>
        </tr>`;
      }
    } else {
      output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: nie rozpoznano wagi lub ilości</div>`;
    }
  }

  output += `<div class="podsumowanie"><img src="src/right.png" alt="" style="width: 40px;"> <strong>Łączna waga: ${total.toFixed(
    2
  )} kg</strong></div>`;
  document.getElementById("output").innerHTML = output;

  const tabelaHTML = `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Produkt</th>
        <th>Ilość</th>
        <th>Waga pojedyncza (kg)</th>
        <th>Waga całkowita (kg)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align: right;"><strong>Łączna waga:</strong></td>
        <td><strong>${total.toFixed(2)} kg</strong></td>
      </tr>
    </tfoot>
  </table>
`;

  document.getElementById("printTable").innerHTML = tabelaHTML;
  // document.getElementById("printTable").style.display = "block";
}

function drukujWyniki() {
  const tabela = document.getElementById("printTable");
  tabela.style.display = "block"; // Pokaż tabelę na chwilę
  window.print(); // Wywołaj drukowanie
  tabela.style.display = "none"; // Ukryj znowu po wydruku
}
