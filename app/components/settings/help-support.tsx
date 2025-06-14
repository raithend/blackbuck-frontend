"use client";

export function HelpSupport() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">よくある質問</h2>
        <div className="space-y-2">
          <h3 className="font-medium">アカウントの削除方法</h3>
          <p className="text-sm text-gray-500">
            設定ページの「アカウント」タブからアカウントを削除できます。
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">パスワードを忘れた場合</h3>
          <p className="text-sm text-gray-500">
            ログインページの「パスワードを忘れた場合」から再設定できます。
          </p>
        </div>
      </div>
    </div>
  );
} 