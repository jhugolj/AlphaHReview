import { generateComparisonRows } from './comparison.js';

// STEP 1 - Adicionar ou remover Critérios
export function addCriteriaInput() {
  var criteriaInputsContainer = document.getElementById('criteriaInputs');
  var numberOfCriteria = criteriaInputsContainer.children.length + 1;

  if (numberOfCriteria <= 5) {
      var div = document.createElement('div');
      div.className = 'checked';

      var label = document.createElement('label');
      label.setAttribute('for', 'criteria' + numberOfCriteria);
      label.innerHTML = '<strong>Criterion ' + numberOfCriteria +"  " + '</strong>';

      var input = document.createElement('input');
      input.setAttribute('class', 'criteria');
      input.setAttribute('type', 'text');
      input.setAttribute('name', 'criteria' + numberOfCriteria);
      input.setAttribute('id', 'criteria' + numberOfCriteria);
      input.setAttribute('required', 'true');
      input.setAttribute('placeholder', 'Insert Criteria ' + numberOfCriteria + ' name');

      div.appendChild(label);
      div.appendChild(input);
      criteriaInputsContainer.appendChild(div);
  } else {
      alert('You can add a maximum of 5 criteria.');
  }
};

// STEP 1 - Função para remover critérios dinamicamente
export function removeCriteriaInput() {
  var criteriaInputsContainer = document.getElementById('criteriaInputs');
  var numberOfCriteria = criteriaInputsContainer.children.length;

  if (numberOfCriteria > 3) {
      criteriaInputsContainer.removeChild(criteriaInputsContainer.lastChild);
  } else {
      alert('At least 3 criteria are required.');
  }
};

// STEP 1 - Ajuste após o envio dos critérios
export function submitForm(event) {
  event.preventDefault();
  var criteriaInputsContainer = document.getElementById('criteriaInputs');
  var inputs = criteriaInputsContainer.getElementsByTagName('input');
  var selectedCriteria = [];

  for (var i = 0; i < inputs.length; i++) {
      selectedCriteria.push(inputs[i].value);
  }

  var selectedCriteriaText = 'Criteria Selected: ' + selectedCriteria.join(', ');
  var selectedCriteriaElement = document.getElementById('selectedCriteria');
  selectedCriteriaElement.textContent = selectedCriteriaText;

  var comparisonContainer = document.getElementById('comparisonContainer');
  comparisonContainer.style.display = 'block';

  generateComparisonRows(selectedCriteria);

  // Popula a segunda linha da tabela com os nomes dos critérios
  populateCriteriaNames(selectedCriteria);
};

// STEP 1 - Função para popular os nomes dos critérios na segunda linha da ahpTable
function populateCriteriaNames(criteriaNames) {
  const ahpTable = document.getElementById("ahpTable");
  const nameRow = ahpTable.querySelector('tr.gray-row');
  criteriaNames.forEach((name, index) => {
      if (nameRow.cells[index]) {
          nameRow.cells[index].textContent = name;
      }
  });
}

// STEP 2 - Função para popular os valores dos critérios na terceira linha da ahpTable
export function populateCriteriaValues(criteriaValues) {
  const ahpTable = document.getElementById("ahpTable");
  const valueRow = ahpTable.rows[2];
  criteriaValues.forEach((value, index) => {
      if (valueRow.cells[index]) {
          valueRow.cells[index].textContent = value.toFixed(3);
      }
  });
}