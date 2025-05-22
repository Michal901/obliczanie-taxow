function obliczWage() {
  const text = document.getElementById("inputText").value;
  const lines = text.split("\n");
  let total = 0;
  let output = "";

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
        output += `<div class="wynik-linia poprawne"><p class="wynik-nazwa">${line.trim()}</p><p class="wynik-mnozenie">➡️ ${weight} kg × ${quantity} = <strong>${lineTotal.toFixed(
          2
        )} kg</strong></p></div>`;
      }
    } else {
      output += `<div class="wynik-linia bledne">${line.trim()} ❌ Błąd: nie rozpoznano wagi lub ilości</div>`;
    }
  }

  output += `<div class="podsumowanie">👉 <strong>Łączna waga: ${total.toFixed(
    2
  )} kg</strong></div>`;
  document.getElementById("output").innerHTML = output;
}
