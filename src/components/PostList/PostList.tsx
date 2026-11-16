import type { Post } from '@/api/posts';

interface PostListProps {
  posts: Post[];
  selectedId: number | null;
  updatingId: number | null; // 추가
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string) => void;
}

const PostList = ({
  posts,
  selectedId,
  onSelect,
  onDelete,
  onUpdate,
  updatingId,
}: PostListProps) => {
  if (posts.length === 0) return <p className="post-empty">게시글이 없습니다.</p>;

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id} className={`post-item${post.id === selectedId ? ' is-selected' : ''}`}>
          {/* 상세 보기 버튼: 현재 선택 상태를 aria-current로 전달 */}
          <button
            type="button"
            className="post-item-title"
            aria-current={post.id === selectedId}
            onClick={() => onSelect(post.id)}
          >
            {post.title}
          </button>
          {/* 어떤 글을 삭제하는지 알 수 있도록 aria-label 지정 */}
          <button
            type="button"
            className="post-item-delete"
            aria-label={`${post.title} 삭제`}
            onClick={() => onDelete(post.id)}
          >
            삭제
          </button>
          <button
            type="button"
            className="post-item-edit"
            aria-label={`${post.title} 수정`}
            disabled={updatingId === post.id}
            aria-busy={updatingId === post.id}
            onClick={() => {
              // 입력창을 띄워서 새 제목을 받음
              const title = window.prompt('새 제목을 입력하세요', post.title);
              // 취소하거나 빈 칸이면 아무것도 안 함
              if (title) onUpdate(post.id, title);
            }}
          >
            {updatingId === post.id ? '수정 중...' : '수정'}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
