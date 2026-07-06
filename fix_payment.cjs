const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/payment.service.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/member_id: string;/g, 'profile_id: string;');
content = content.replace(/req\.member_id/g, 'req.profile_id');
content = content.replace(/p\.member_id/g, 'p.profile_id');
content = content.replace(/getMemberPayments\(memberId: string\)/g, 'getMemberPayments(profileId: string)');
content = content.replace(/'member_id', memberId/g, "'profile_id', profileId");
content = content.replace(/p => p\.member_id === memberId/g, 'p => p.profile_id === profileId');
content = content.replace(/member_id/g, 'profile_id'); // Catch-all for any remaining member_id in payment.service.ts

fs.writeFileSync(file, content, 'utf8');
console.log('payment.service.ts updated');
