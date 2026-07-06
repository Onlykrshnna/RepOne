const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/members.service.ts');
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\.eq\('member_id', memberId\)/g, ".eq('profile_id', memberId)");
    content = content.replace(/\.eq\('member_id', profileId\)/g, ".eq('profile_id', profileId)");
    content = content.replace(/payment\.member_id/g, "payment.profile_id");
    fs.writeFileSync(file, content, 'utf8');
    console.log('members.service.ts updated');
}
