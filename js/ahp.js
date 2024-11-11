// STEP 2 - Função para calcular a razão de consistência
export function calculateConsistencyRatio(matrix, priorities) {
  var n = matrix.length;
  var lambdaMax = matrix.reduce((sum, row, i) => sum + row.reduce((rowSum, value, j) => rowSum + value * priorities[j], 0) / priorities[i], 0) / n;
  var consistencyIndex = (lambdaMax - n) / (n - 1);
  var randomIndex = {
      1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
      6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
  };
  return consistencyIndex / randomIndex[n];
}

export function calculatePriorities(pairwiseMatrix) {
    const n = pairwiseMatrix.length;
    var sums = pairwiseMatrix[0].map((_, colIndex) => pairwiseMatrix.reduce((sum, row) => sum + row[colIndex], 0));
    var normalizedMatrix = pairwiseMatrix.map(row => row.map((value, colIndex) => value / sums[colIndex]));
    var priorities = normalizedMatrix.map(row => row.reduce((sum, value) => sum + value, 0) / n);
    return priorities;
}

