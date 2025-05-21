function obliczWage() {
  const text = document.getElementById("inputText").value;
  const lines = text.split("\n");
  let total = 0;
  let output = "";

  for (const line of lines) {
    const weightMatch = line.match(/(-?\d+,\d+|-?\d+)(?=kg)/);
    const quantityMatch = line.match(/(\d+,\d+|\d+)\s*$/);

    if (weightMatch && quantityMatch) {
      const weight = parseFloat(weightMatch[0].replace(",", "."));
      const quantity = parseFloat(quantityMatch[0].replace(",", "."));

      if (weight > 0 && quantity > 0) {
        const lineTotal = weight * quantity;
        total += lineTotal;
        output += `<div class="wynik-linia poprawne"><p class="wynik-nazwa">${line.trim()}</p><p class="wynik-mnozenie">➡️ ${weight} kg × ${quantity} = <strong>${lineTotal.toFixed(
          2
        )} kg</strong> </p></div>`;
      } else {
        output += `<div class="wynik-linia bledne">${line.trim()} (waga lub ilość mniejsza/równa 0 – pominięto)</div>`;
      }
    } else {
      output += `<div class="wynik-linia bledne">${line.trim()} (nie rozpoznano wagi/ilości)</div>`;
    }
  }

  output += `<div class="podsumowanie">👉 <strong>Łączna waga: ${total.toFixed(
    2
  )} kg</strong></div>`;
  document.getElementById("output").innerHTML = output;
}
