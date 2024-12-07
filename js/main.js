import { processFile, downloadCriteriaTable } from './fileManager.js'
import { addCriteriaInput, removeCriteriaInput, submitForm } from './criteria.js'
import { pairwiseCalculation } from './comparison.js'
import { buildRankTable } from './rankTable.js'


document.getElementById('addCriteriaBtn').addEventListener('click', addCriteriaInput)
document.getElementById('removeCriteriaBtn').addEventListener('click', removeCriteriaInput)
document.getElementById('criteriaForm').addEventListener('submit', submitForm)
document.getElementById('pairwiseBtn').addEventListener('click', pairwiseCalculation)
document.getElementById('fileProcessBtn').addEventListener('click', processFile)
document.getElementById('downloadCriteriaBtn').addEventListener('click', downloadCriteriaTable)
document.getElementById('buildRankTableBtn').addEventListener('click', buildRankTable)