// STEP 4 - Função para construir a tabela de ranking
export function buildRankTable() {
  const ahpTable = document.getElementById('ahpTable');
  const weights = Array.from(ahpTable.rows[2].cells).map(cell => parseFloat(cell.innerText) || 0); 

  const resultsTable = document.getElementById('resultsWT');
  
  const rankTableDiv = document.getElementById('ranktable');
  const rankTable = document.createElement('table');
  rankTable.className = 'ranktable';
  
  const headerRow = resultsTable.rows[0].cloneNode(true);
  const totalHeaderCell = document.createElement('th');
  totalHeaderCell.innerText = 'Total';
  headerRow.appendChild(totalHeaderCell);
  rankTable.appendChild(headerRow);

  for (let i = 1; i < resultsTable.rows.length; i++) {
      const resultRow = resultsTable.rows[i];
      const newRow = document.createElement('tr');
      
      for (let j = 0; j < 4; j++) {
          const cell = resultRow.cells[j].cloneNode(true);
          newRow.appendChild(cell);
      }

      let total = 0;
      const multiplications = [
          {col: 4, weight: weights[0]},
          {col: 5, weight: weights[1]},
          {col: 6, weight: weights[2]},
          {col: 7, weight: weights[3]},
          {col: 8, weight: weights[4]}
      ];

      multiplications.forEach(({col, weight}, index) => {
          const cell = resultRow.cells[col];
          const value = parseFloat(cell.innerText) || 0;
          const result = value * weight;
          total += result;

          const newCell = document.createElement('td');
          newCell.innerText = result.toFixed(2);
          newRow.appendChild(newCell);
      });

      const totalCell = document.createElement('td');
      totalCell.innerText = total.toFixed(2);
      newRow.appendChild(totalCell);

      rankTable.appendChild(newRow); 
  }

  rankTableDiv.innerHTML = '';
  rankTableDiv.appendChild(rankTable);
}