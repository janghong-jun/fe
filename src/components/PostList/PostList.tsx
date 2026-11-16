import type { Post } from '@/api/posts';

interface PostListProps {
  posts: Post[];
  selectedId: number | null;
  updatingId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}

const PostList = ({
  posts,
  selectedId,
  onSelect,
  onDelete,
  onUpdate,
  updatingId,
}: PostListProps) => {
  if (posts.length === 0) {
    return <p className="post-empty">게시글이 없습니다.</p>;
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id} className={`post-item${post.id === selectedId ? ' is-selected' : ''}`}>
          <button
            type="button"
            className="post-item-title"
            aria-current={post.id === selectedId}
            onClick={() => onSelect(post.id)}
          >
            {post.title}
          </button>

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
            onClick={() => onUpdate(post.id)}
          >
            {updatingId === post.id ? '수정 중...' : '수정'}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
