-- コメントテーブルの作成
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    location TEXT,
    classification TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL, -- コメントの返信用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- RLS（Row Level Security）の有効化
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- コメントテーブルのRLSポリシー
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comment creators can update their comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Comment creators can delete their comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- コメントテーブルにupdated_atトリガーを設定
CREATE TRIGGER handle_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();
