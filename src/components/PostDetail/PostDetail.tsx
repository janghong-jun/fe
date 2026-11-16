import { useQuery } from '@tanstack/react-query';
import { getPost, type Post } from '@/api/posts';

interface PostDetailProps {
  id: number;
  fallback?: Post; // 로컬에서 만든 글(서버에 저장 안 됨)용 대체 데이터
}

const PostDetail = ({ id, fallback }: PostDetailProps) => {
  // JSONPlaceholder는 POST를 저장하지 않으므로 id 100 초과는 서버 조회 생략
  const isLocal = id > 100;

  const { data, error, isLoading } = useQuery({
    queryKey: ['post', id], // 냉장고 칸의 이름표
    queryFn: ({ signal }) => getPost(id, signal), // 칸이 비어 있을 때 배달원을 보내는 방법
    enabled: !isLocal, // 로컬 글은 배달원을 보내지 않음
  });

  const post = isLocal ? fallback : data;

  return (
    <section className="post-detail" aria-live="polite" aria-busy={isLoading}>
      {isLoading && <p>불러오는 중...</p>}
      {error && (
        <p role="alert" className="post-error">
          {error.message}
        </p>
      )}
      {post && !isLoading && (
        <article>
          <h2 className="post-detail-title">{fallback?.title ?? post.title}</h2>
          <p className="post-detail-body">{post.body}</p>
        </article>
      )}
    </section>
  );
};

export default PostDetail;
