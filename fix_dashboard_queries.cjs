const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/dashboard.service.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.from\('members'\)[\s\S]*?\.eq\('member_id', memberId\)/, match => match.replace(/'member_id', memberId/, "'id', memberId"));
content = content.replace(/\.from\('payments'\)[\s\S]*?\.eq\('member_id', memberId\)/, match => match.replace(/'member_id', memberId/, "'profile_id', memberId"));
content = content.replace(/p\.member_id === memberId/g, 'p.profile_id === memberId');

fs.writeFileSync(file, content, 'utf8');
console.log('dashboard.service.ts properly fixed');
