const { render } = require('@react-email/render');
const fs = require('fs');
const path = require('path');

// React Emailコンポーネントを直接定義
const ConfirmSignupEmail = ({ username, confirmUrl }) => {
  const React = require('react');
  const { Html } = require('@react-email/html');
  const { Head } = require('@react-email/head');
  const { Container } = require('@react-email/container');
  const { Section } = require('@react-email/section');
  const { Text } = require('@react-email/text');
  const { Button } = require('@react-email/button');

  return React.createElement(Html, { lang: "ja" },
    React.createElement(Head),
    React.createElement(Container, { 
      style: { maxWidth: 480, margin: '0 auto', padding: 24, fontFamily: 'sans-serif', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' } 
    },
      React.createElement(Section, {},
        React.createElement(Text, { style: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 } }, "会員登録の確認"),
        React.createElement(Text, { style: { fontSize: 16, marginBottom: 16 } }, 
          (username ? username + "様、" : "") + "Blackbuckをご利用いただきありがとうございます。",
          React.createElement('br'),
          "下のボタンをクリックして、メールアドレスの確認を完了してください。"
        ),
        React.createElement(Button, { 
          href: confirmUrl, 
          style: { background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: 6, fontSize: 16, fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', margin: '24px 0' } 
        }, "メールアドレスを確認する"),
        React.createElement(Text, { style: { fontSize: 14, color: '#888', marginTop: 24 } }, "このメールに心当たりがない場合は、破棄してください。"),
        React.createElement(Text, { style: { fontSize: 12, color: '#bbb', marginTop: 16 } }, "© " + new Date().getFullYear() + " Blackbuck")
      )
    )
  );
};

const ResetPasswordEmail = ({ username, resetUrl }) => {
  const React = require('react');
  const { Html } = require('@react-email/html');
  const { Head } = require('@react-email/head');
  const { Container } = require('@react-email/container');
  const { Section } = require('@react-email/section');
  const { Text } = require('@react-email/text');
  const { Button } = require('@react-email/button');

  return React.createElement(Html, { lang: "ja" },
    React.createElement(Head),
    React.createElement(Container, { 
      style: { maxWidth: 480, margin: '0 auto', padding: 24, fontFamily: 'sans-serif', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' } 
    },
      React.createElement(Section, {},
        React.createElement(Text, { style: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 } }, "パスワード再設定"),
        React.createElement(Text, { style: { fontSize: 16, marginBottom: 16 } }, 
          (username ? username + "様、" : "") + "パスワードの再設定リクエストを受け付けました。",
          React.createElement('br'),
          "下のボタンをクリックして、新しいパスワードを設定してください。"
        ),
        React.createElement(Button, { 
          href: resetUrl, 
          style: { background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: 6, fontSize: 16, fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', margin: '24px 0' } 
        }, "パスワードを再設定する"),
        React.createElement(Text, { style: { fontSize: 14, color: '#888', marginTop: 24 } }, "このメールに心当たりがない場合は、破棄してください。"),
        React.createElement(Text, { style: { fontSize: 12, color: '#bbb', marginTop: 16 } }, "© " + new Date().getFullYear() + " Blackbuck")
      )
    )
  );
};

// HTMLを生成する関数
async function generateHTML() {
  try {
    // ConfirmSignupEmailのHTMLを生成
    const confirmSignupHTML = await render(
      ConfirmSignupEmail({
        username: '{{ .Email }}',
        confirmUrl: '{{ .ConfirmationURL }}',
      })
    );
    
    fs.writeFileSync(
      path.join(__dirname, '../app/email/confirm-signup-generated.html'),
      confirmSignupHTML
    );
    
    console.log('✅ confirm-signup-generated.html を生成しました');
    
    // ResetPasswordEmailのHTMLを生成
    const resetPasswordHTML = await render(
      ResetPasswordEmail({
        username: '{{ .Email }}',
        resetUrl: '{{ .ConfirmationURL }}',
      })
    );
    
    fs.writeFileSync(
      path.join(__dirname, '../app/email/reset-password-generated.html'),
      resetPasswordHTML
    );
    
    console.log('✅ reset-password-generated.html を生成しました');
    console.log('🎉 すべてのHTMLファイルを生成しました');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

generateHTML(); 