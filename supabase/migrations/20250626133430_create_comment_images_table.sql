-- コメント画像テーブルの作成
CREATE TABLE IF NOT EXISTS comment_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- コメント画像のインデックス
CREATE INDEX IF NOT EXISTS idx_comment_images_comment_id ON comment_images(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_images_order ON comment_images(comment_id, order_index);

-- RLS（Row Level Security）の有効化
ALTER TABLE comment_images ENABLE ROW LEVEL SECURITY;

-- コメント画像テーブルのRLSポリシー
CREATE POLICY "Comment images are viewable by everyone" ON comment_images
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comment images" ON comment_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM comments 
            WHERE comments.id = comment_images.comment_id 
            AND comments.user_id = auth.uid()
        )
    );

CREATE POLICY "Comment creators can update their comment images" ON comment_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM comments 
            WHERE comments.id = comment_images.comment_id 
            AND comments.user_id = auth.uid()
        )
    );

CREATE POLICY "Comment creators can delete their comment images" ON comment_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM comments 
            WHERE comments.id = comment_images.comment_id 
            AND comments.user_id = auth.uid()
        )
    );
