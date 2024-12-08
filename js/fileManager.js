// STEP 3 - Função para processar e carregar o arquivo
export function processFile() {
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
          
              columnValues.forEach((values, index) => {
                  const minCell = minRow.insertCell();
              
                  if (values.length > 0) {
                      const min = Math.min(...values);
                      
                      // Obtém o tipo de otimização do critério para decidir o ajuste do mínimo
                      const criteriaType = document.getElementById(`criteria${index + 1}Type`).value;
              
                      let adjustedMin;
                      if (criteriaType === "minimum") {
                          adjustedMin = min; // Não aplica o ajuste de 0,99 para minimum
                      } else {
                          adjustedMin = min;
                      }
              
                      minCell.textContent = adjustedMin.toFixed(3);
                  } else {
                      minCell.textContent = 'N/A';
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

// STEP 3 - Função para exibir os resultados normalizados
export function showMoreResults(columnValues, articleYearIndex) {
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

                // Obter o tipo de otimização do critério (maximum/minimum) baseado na escolha do usuário
                const criteriaType = document.getElementById(`criteria${cellIndex - articleYearIndex}Type`).value;

                // Verifica se o valor é válido e aplica a fórmula de acordo com o critério
                if (!isNaN(originalValue) && !isNaN(max) && !isNaN(min) && max !== min) {
                    if (criteriaType === "maximum") {
                        // Fórmula para maximização
                        newCell.textContent = ((originalValue - min) / (max - min)).toFixed(3);
                    } else if (criteriaType === "minimum") {
                        // Fórmula para minimização
                        newCell.textContent = ((max - originalValue) / (max - min)).toFixed(3);
                    } else {
                        newCell.textContent = 'N/A'; // Caso o critério não esteja selecionado
                    }
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

// STEP 3 - Função para fazer o download da tabela de critérios
export function downloadCriteriaTable() {
  // Títulos das colunas, incluindo os critérios inseridos no Step 1
  const headers = [
      "Article Title",
      "Authors",
      "Journal",
      "Article Year",
      localStorage.getItem("criterion1") || "Criterion 1",
      localStorage.getItem("criterion2") || "Criterion 2",
      localStorage.getItem("criterion3") || "Criterion 3",
      localStorage.getItem("criterion4") || "",
      localStorage.getItem("criterion5") || ""
  ].filter(Boolean); // Remove colunas vazias para critérios inexistentes

  // Dados dos artigos (para ilustrar, substitua pelo seu array de dados)
  const articles = [
      {
          title: ["Here is the Article Title 1"],
          authors: ["Authors names 1",],
          journal: ["Journal Name 1"],
          year: ["2024"],
          criteria: ["Value 1", "Value 2", "Value 3", "Value 4?", "Value 5?"]
      },
      // ... adicionar outros artigos conforme necessário
  ];

  // Construir as linhas do CSV
  const rows = [headers.join(",")];
  articles.forEach(article => {
      const row = [
          article.title,
          article.authors[0] || "",  // Primeiro autor
          article.journal,
          article.year,
          ...(article.criteria.slice(0, 5)) // Garantir no máximo 5 critérios
      ];
      rows.push(row.join(","));
  });

  // Criar o Blob do CSV
  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Criar link para download
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.setAttribute("download", "Criterias.csv");
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
