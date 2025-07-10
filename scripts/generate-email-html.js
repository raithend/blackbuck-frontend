const { render } = require('@react-email/render');
const fs = require('fs');
const path = require('path');

// ConfirmSignupEmailのHTMLを生成
async function generateConfirmSignupHTML() {
  const { default: ConfirmSignupEmail } = require('../app/email/ConfirmSignupEmail.tsx');
  
  const html = await render(
    ConfirmSignupEmail({
      username: '{{ .Email }}',
      confirmUrl: '{{ .ConfirmationURL }}',
    })
  );
  
  fs.writeFileSync(
    path.join(__dirname, '../app/email/confirm-signup-generated.html'),
    html
  );
  
  console.log('✅ confirm-signup-generated.html を生成しました');
}

// ResetPasswordEmailのHTMLを生成
async function generateResetPasswordHTML() {
  const { default: ResetPasswordEmail } = require('../app/email/ResetPasswordEmail.tsx');
  
  const html = await render(
    ResetPasswordEmail({
      username: '{{ .Email }}',
      resetUrl: '{{ .ConfirmationURL }}',
    })
  );
  
  fs.writeFileSync(
    path.join(__dirname, '../app/email/reset-password-generated.html'),
    html
  );
  
  console.log('✅ reset-password-generated.html を生成しました');
}

// メイン実行
async function main() {
  try {
    await generateConfirmSignupHTML();
    await generateResetPasswordHTML();
    console.log('🎉 すべてのHTMLファイルを生成しました');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

main(); 