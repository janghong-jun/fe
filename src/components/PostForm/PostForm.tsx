import { useState, type FormEvent } from 'react';
import type { PostInput } from '@/api/posts';

interface PostFormProps {
  onSubmit: (data: PostInput) => Promise<void>;
}

const PostForm = ({ onSubmit }: PostFormProps) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ userId: 1, title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
    } finally {
      setIsSubmitting(false); // 성공/실패와 무관하게 버튼 복구
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {/* label-input 연결: htmlFor / id */}
      <div className="post-form-row">
        <label htmlFor="post-title">제목</label>
        <input
          id="post-title"
          type="text"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="post-form-row">
        <label htmlFor="post-body">내용</label>
        <textarea
          id="post-body"
          rows={3}
          value={body}
          required
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      {/* 전송 중 중복 클릭 방지 + 상태 전달 */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? '등록 중...' : '글 등록'}
      </button>
    </form>
  );
};

export default PostForm;
