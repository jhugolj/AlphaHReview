//STEP 1- Adicionar ou remover Critérios
document.getElementById('addCriteriaBtn').addEventListener('click', function() {
    var criteriaInputsContainer = document.getElementById('criteriaInputs');
    var numberOfCriteria = criteriaInputsContainer.children.length + 1;

    if (numberOfCriteria <= 5) {
        var div = document.createElement('div');
        div.className = 'checked';

        var label = document.createElement('label');
        label.setAttribute('for', 'criteria' + numberOfCriteria);
        label.innerHTML = '<strong>Criteria ' + numberOfCriteria +"  " + '</strong>';

        var input = document.createElement('input');
        input.setAttribute('class', 'criteria');
        input.setAttribute('type', 'text');
        input.setAttribute('name', 'criteria' + numberOfCriteria);
        input.setAttribute('id', 'criteria' + numberOfCriteria);
        input.setAttribute('required', 'true');
        input.setAttribute('placeholder', 'Type the name of criterion' + numberOfCriteria);


        div.appendChild(label);
        div.appendChild(input);
        criteriaInputsContainer.appendChild(div);
    } else {
        alert('You can add a maximum of 5 criteria.');
    }
});

// Função para remover critérios dinamicamente
document.getElementById('removeCriteriaBtn').addEventListener('click', function() {
    var criteriaInputsContainer = document.getElementById('criteriaInputs');
    var numberOfCriteria = criteriaInputsContainer.children.length;

    if (numberOfCriteria > 3) {
        criteriaInputsContainer.removeChild(criteriaInputsContainer.lastChild);
    } else {
        alert('At least 3 criteria are required.');
    }
});


// Ajuste após o envio dos critérios
document.getElementById('criteriaForm').addEventListener('submit', function(event) {
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
});

// Função para popular os nomes dos critérios na segunda linha da ahpTable
function populateCriteriaNames(criteriaNames) {
    const ahpTable = document.getElementById("ahpTable");
    const nameRow = ahpTable.querySelector('tr.gray-row');
    criteriaNames.forEach((name, index) => {
        if (nameRow.cells[index]) {
            nameRow.cells[index].textContent = name;
        }
    });
}

// Função para gerar linhas de comparação pareada
function generateComparisonRows(criteriaList) {
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

// Função para calcular e preencher os pesos na terceira linha da tabela AHP
document.getElementById('pairwiseBtn').addEventListener('click', function() {
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

    var sums = pairwiseMatrix[0].map((_, colIndex) => pairwiseMatrix.reduce((sum, row) => sum + row[colIndex], 0));
    var normalizedMatrix = pairwiseMatrix.map(row => row.map((value, colIndex) => value / sums[colIndex]));
    var priorities = normalizedMatrix.map(row => row.reduce((sum, value) => sum + value, 0) / n);

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
    var consistencyMessage = consistencyRatio <= 0.1 ? '<strong>Judgments ARE CONSISTENT. You can continue to the next step</strong>' : '<strong>The judgments are INCONSISTENT. Please REVIEW your comparisons.</strong>';
    var consistencyMessageClass = consistencyRatio <= 0.1 ? 'consistent' : 'inconsistent';

    var consistencyLi = document.createElement('li');
    consistencyLi.innerHTML = `<strong>Consistency Ratio:</strong> ${consistencyRatio.toFixed(3)}<br> <span class="${consistencyMessageClass}">${consistencyMessage}</span>`;
    calculatedWeights.appendChild(consistencyLi);

    resultsContainer.style.display = 'flex';
});

// Função para popular os valores dos critérios na terceira linha da ahpTable
function populateCriteriaValues(criteriaValues) {
    const ahpTable = document.getElementById("ahpTable");
    const valueRow = ahpTable.rows[2];
    criteriaValues.forEach((value, index) => {
        if (valueRow.cells[index]) {
            valueRow.cells[index].textContent = value.toFixed(3);
        }
    });
}

// Função para calcular a razão de consistência
function calculateConsistencyRatio(matrix, priorities) {
    var n = matrix.length;
    var lambdaMax = matrix.reduce((sum, row, i) => sum + row.reduce((rowSum, value, j) => rowSum + value * priorities[j], 0) / priorities[i], 0) / n;
    var consistencyIndex = (lambdaMax - n) / (n - 1);
    var randomIndex = {
        1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
        6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
    };
    return consistencyIndex / randomIndex[n];
}

//STEP3

function processFile() {
    const fileInput = document.getElementById('uploadFile');
    const file = fileInput.files[0];
    const loadingIndicator = document.getElementById('loading');

    if (file) {
        loadingIndicator.style.display = 'inline'; // Mostra o indicador de carregamento
        const reader = new FileReader();

        reader.onload = function (e) {
            const contents = e.target.result;
            const lines = contents.split('\n').filter(line => line.trim() !== ''); // Filtra linhas vazias
            const originalTable = document.getElementById('resultsTable');
            let articleYearIndex = -1; // Índice da coluna "Article Year"
            const columnValues = []; // Armazena os valores a partir da coluna "Article Year"

            // Limpar a tabela original
            originalTable.innerHTML = '';

            lines.forEach((line, lineNumber) => {
                const cells = line.split(','); // Supondo que o arquivo seja CSV (valores separados por vírgula)
                const row = originalTable.insertRow();

                cells.forEach((cell, cellNumber) => {
                    const cellValue = parseFloat(cell.trim());
                    const dataCell = row.insertCell();
                    dataCell.textContent = cell.trim();

                    // Identificar a posição da coluna "Article Year"
                    if (lineNumber === 0 && cell.trim().toLowerCase() === 'article year') {
                        articleYearIndex = cellNumber;
                    }

                    // Se já identificamos a coluna "Article Year", começamos a armazenar os valores após ela
                    if (articleYearIndex !== -1 && lineNumber > 0 && cellNumber > articleYearIndex) {
                        const index = cellNumber - (articleYearIndex + 1);
                        columnValues[index] = columnValues[index] || [];
                        if (!isNaN(cellValue)) {
                            columnValues[index].push(cellValue);
                        }
                    }
                });
            });

            // Função para verificar se a última linha contém dados antes de adicionar uma nova
            function isLastRowEmpty(table) {
                const lastRow = table.rows[table.rows.length - 1];
                if (!lastRow) return false;

                // Verifica se todas as células da última linha estão vazias
                for (let cell of lastRow.cells) {
                    if (cell.textContent.trim() !== '') {
                        return false;
                    }
                }
                return true;
            }

            // Adicionar linha para os valores máximos, se não houver linha vazia
            if (!isLastRowEmpty(originalTable)) {
                const maxRow = originalTable.insertRow();
                for (let i = 0; i < articleYearIndex; i++) {
                    maxRow.insertCell(); // Adiciona células vazias até a coluna "Article Year"
                }
                const maxLabelCell = maxRow.insertCell();
                maxLabelCell.innerHTML = '<strong>Maximum</strong>';

                columnValues.forEach((values) => {
                    const maxCell = maxRow.insertCell();
                    if (values.length > 0) {
                        const max = Math.max(...values);
                        maxCell.textContent = max.toFixed(3);
                    } else {
                        maxCell.textContent = '-';
                    }
                });
            }

            // Adicionar linha para os valores mínimos logo abaixo da linha de máximos
            if (!isLastRowEmpty(originalTable)) {
                const minRow = originalTable.insertRow();
                for (let i = 0; i < articleYearIndex; i++) {
                    minRow.insertCell(); // Adiciona células vazias até a coluna "Article Year"
                }
                const minLabelCell = minRow.insertCell();
                minLabelCell.innerHTML = '<strong>Minimum</strong>';
            
                columnValues.forEach((values) => {
                    const minCell = minRow.insertCell();
                    if (values.length > 0) {
                        const min = Math.min(...values);
                        const adjustedMin = min * 0.999; // Reduz 0,1% do valor mínimo
                        minCell.textContent = adjustedMin.toFixed(3);
                    } else {
                        minCell.textContent = '-';
                    }
                });
            }

            loadingIndicator.style.display = 'none'; // Esconde o indicador de carregamento

            // Adiciona o botão "Normalized Results" após a tabela original
            const showResultsButton = document.createElement('button');
            showResultsButton.textContent = 'Normalized Results';
            showResultsButton.classList.add('stepbutton'); 
            showResultsButton.onclick = () => showMoreResults(columnValues, articleYearIndex);
            originalTable.parentNode.appendChild(showResultsButton);
        };

        reader.readAsText(file);
    } else {
        alert('Selecione um arquivo válido.');
    }
}

// Função para exibir os resultados normalizados
function showMoreResults(columnValues, articleYearIndex) {
    const originalTable = document.getElementById('resultsTable');
    const numRows = originalTable.rows.length - 2; // Exclui as duas últimas linhas de máximo e mínimo
    const numCols = originalTable.rows[0].cells.length;

    // Seleciona a div "resultsContainer" para posicionar a nova tabela dentro dela
    const resultsContainer = document.getElementById('resultsWT');

    // Verifica se a div foi encontrada antes de prosseguir
    if (!resultsContainer) {
        console.error('Elemento <div> com id "resultsWT" não encontrado.');
        return;
    }

    // Torna o container visível para exibir a tabela
    resultsContainer.style.display = 'block';

    // Cria a tabela de resultados normalizados
    const newTable = document.createElement('table');
    newTable.id = 'resultsWT';
    newTable.classList.add('resultsWT');

    // Copia o cabeçalho da tabela original
    const headerRow = originalTable.rows[0].cloneNode(true);
    newTable.appendChild(headerRow);

    // Adiciona linhas normalizadas
    for (let rowIndex = 1; rowIndex < numRows; rowIndex++) {
        const newRow = newTable.insertRow();

        for (let cellIndex = 0; cellIndex < numCols; cellIndex++) {
            const newCell = newRow.insertCell();
            const originalCell = originalTable.rows[rowIndex].cells[cellIndex];

            // Realiza a normalização apenas nas colunas após "Article Year"
            if (cellIndex > articleYearIndex) {
                const originalValue = parseFloat(originalCell.textContent);
                const max = parseFloat(originalTable.rows[numRows].cells[cellIndex].textContent);
                const min = parseFloat(originalTable.rows[numRows + 1].cells[cellIndex].textContent);

                // Verifica se o valor é válido e calcula a normalização
                if (!isNaN(originalValue) && !isNaN(max) && !isNaN(min) && max !== min) {
                    newCell.textContent = ((originalValue - min) / (max - min)).toFixed(3);
                } else {
                    newCell.textContent = 'N/A';
                }
            } else {
                newCell.textContent = originalCell.textContent;
            }
        }
    }

    // Adiciona a nova tabela diretamente dentro do "resultsContainer"
    resultsContainer.appendChild(newTable);
}
