import { useQuery } from '@tanstack/react-query';
import { getPost, type Post } from '@/api/posts';

interface PostDetailProps {
  id: number;
  fallback?: Post;
}

const PostDetail = ({ id, fallback }: PostDetailProps) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: ({ signal }) => getPost(id, signal),
    initialData: fallback,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <section className="post-detail" aria-live="polite" aria-busy={isLoading}>
      {isLoading && <p>불러오는 중...</p>}

      {error && (
        <p role="alert" className="post-error">
          {error.message}
        </p>
      )}

      {data && !isLoading && (
        <article>
          <h2 className="post-detail-title">{data.title}</h2>
          <p className="post-detail-body">{data.body}</p>
        </article>
      )}
    </section>
  );
};

export default PostDetail;
