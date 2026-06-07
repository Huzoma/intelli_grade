const fs = require('fs');
const filePath = 'C:/Users/PC/Documents/intelli_grade/intelligrade/src/app/student/review/[id]/StudentReviewClient.jsx';
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

for (let i = 114; i <= 126; i++) {
  console.log(`Line ${i + 1}: ${JSON.stringify(lines[i])}`);
}
