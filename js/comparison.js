import { calculatePriorities, calculateConsistencyRatio } from './ahp.js';
import { populateCriteriaValues } from './criteria.js';

// STEP 2 - Função para gerar linhas de comparação pareada
export function generateComparisonRows(criteriaList) {
  var comparisonRowsContainer = document.getElementById('comparisonRows');
  comparisonRowsContainer.innerHTML = '';

  for (var i = 0; i < criteriaList.length; i++) {
      for (var j = i + 1; j < criteriaList.length; j++) {
          var row = document.createElement('tr');

          var criteriaXCell = document.createElement('td');
          criteriaXCell.innerHTML = `<label><input type="radio" name="comparison${i}-${j}" value="X">${criteriaList[i]}</label>`;
          row.appendChild(criteriaXCell);

          var criteriaYCell = document.createElement('td');
          criteriaYCell.innerHTML = `<label><input type="radio" name="comparison${i}-${j}" value="Y">${criteriaList[j]}</label>`;
          row.appendChild(criteriaYCell);

          var equalCell = document.createElement('td');
          equalCell.innerHTML = `<label><input type="radio" name="score${i}-${j}" value="1">Equal</label>`;
          row.appendChild(equalCell);

          var scoreCell = document.createElement('td');
          var radioGroup = document.createElement('div');
          for (var k of [2, 3, 4, 5, 6, 7, 8, 9]) {
              var radioLabel = document.createElement('label');
              radioLabel.innerHTML = `<input type="radio" name="score${i}-${j}" value="${k}">${k}`;
              radioGroup.appendChild(radioLabel);
          }
          scoreCell.appendChild(radioGroup);
          row.appendChild(scoreCell);

          comparisonRowsContainer.appendChild(row);
      }
  }

  document.getElementById('comparisonContainer').style.display = 'block';
}

// STEP 2 - Função para calcular e preencher os pesos na terceira linha da tabela AHP
export function pairwiseCalculation() {
  var comparisonRowsContainer = document.getElementById('comparisonRows');
  var rows = comparisonRowsContainer.getElementsByTagName('tr');
  var n = Math.sqrt(rows.length * 2 + 1/4) + 1/2;
  var pairwiseMatrix = Array.from(Array(n), () => Array(n).fill(1));

  for (var i = 0; i < rows.length; i++) {
      var inputs = rows[i].getElementsByTagName('input');
      var comparisonIndex = inputs[0].name.replace('comparison', '').split('-').map(Number);
      var scoreIndex = 'score' + comparisonIndex.join('-');
      var scoreValue = Array.from(inputs).find(input => input.name === scoreIndex && input.checked)?.value || 1;
      var chosenCriteria = Array.from(inputs).find(input => input.name.startsWith('comparison') && input.checked)?.value;

      if (chosenCriteria === 'X') {
          pairwiseMatrix[comparisonIndex[0]][comparisonIndex[1]] = parseInt(scoreValue);
          pairwiseMatrix[comparisonIndex[1]][comparisonIndex[0]] = 1 / parseInt(scoreValue);
      } else if (chosenCriteria === 'Y') {
          pairwiseMatrix[comparisonIndex[0]][comparisonIndex[1]] = 1 / parseInt(scoreValue);
          pairwiseMatrix[comparisonIndex[1]][comparisonIndex[0]] = parseInt(scoreValue);
      } else {
          pairwiseMatrix[comparisonIndex[0]][comparisonIndex[1]] = 1;
          pairwiseMatrix[comparisonIndex[1]][comparisonIndex[0]] = 1;
      }
  }

  var priorities = calculatePriorities(pairwiseMatrix);

  // Popula a terceira linha da tabela AHP com os pesos calculados
  populateCriteriaValues(priorities);

  var resultsContainer = document.getElementById('resultsContainer');
  var calculatedWeights = document.getElementById('calculatedWeights');
  calculatedWeights.innerHTML = '';
  priorities.forEach((weight, index) => {
      var li = document.createElement('li');
      li.innerHTML = `<strong>Criteria ${index + 1}:</strong> ${weight.toFixed(3)}`;
      calculatedWeights.appendChild(li);
  });
  
  var consistencyRatio = calculateConsistencyRatio(pairwiseMatrix, priorities);
  var consistencyMessage = consistencyRatio <= 0.1 ? '<strong>Judgments ARE CONSISTENT. You can SAVE COMPARISON and continue to the next step</strong>' : '<strong>The judgments are INCONSISTENT. Please REVIEW your comparisons before saving..</strong>';
  var consistencyMessageClass = consistencyRatio <= 0.1 ? 'consistent' : 'inconsistent';

  var consistencyLi = document.createElement('li');
  consistencyLi.innerHTML = `<strong>Consistency Ratio:</strong> ${consistencyRatio.toFixed(3)}<br> <span class="${consistencyMessageClass}">${consistencyMessage}</span>`;
  calculatedWeights.appendChild(consistencyLi);

  resultsContainer.style.display = 'flex';
};