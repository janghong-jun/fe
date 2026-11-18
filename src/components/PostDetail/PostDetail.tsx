import { useQuery } from '@tanstack/react-query';
import { getPost, type Post } from '@/api/posts';

interface PostDetailProps {
  id: number;
  fallback?: Post;
}

const PostDetail = ({ id }: PostDetailProps) => {
  const { data, error, isLoading, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: ['post', id],
    queryFn: ({ signal }) => getPost(id, signal),
    enabled: id > 0,
    placeholderData: (previousData) => previousData,
  });
  console.log({
    isPlaceholderData,
    isFetching,
    title: data?.title,
  });
  return (
    <>
      <section className="post-detail" aria-live="polite" aria-busy={isLoading}>
        {isPlaceholderData && <p>이전 게시글 데이터 표시 중...</p>}
        {isFetching && <p>불러오는 중...</p>}
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
      <button onClick={() => refetch()}>다시 불러오기</button>
    </>
  );
};

export default PostDetail;
