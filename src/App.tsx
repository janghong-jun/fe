import { useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
  type Post,
  type PostInput,
} from '@/api/posts';
import PostList from '@/components/PostList';
import PostDetail from '@/components/PostDetail';
import PostForm from '@/components/PostForm';

const App = () => {
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // 목록: 쪽 단위로 냉장고 ['posts'] 칸에 쌓음
  const {
    data,
    error: loadError,
    isLoading,
    fetchNextPage, // 다음 쪽을 받아 오는 함수
    hasNextPage, // 다음 쪽이 더 있는지
    isFetchingNextPage, // 다음 쪽을 받아 오는 중인지
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ signal, pageParam }) => getPosts(signal, pageParam),
    initialPageParam: 1, // 처음엔 1쪽부터
    // 이 서버는 글이 100개(10쪽)라서 10쪽 전까지만 다음 쪽이 있음
    getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
      lastPageParam < 10 ? lastPageParam + 1 : undefined,
  });
  const posts = data?.pages.flat() ?? []; // 쪽별 묶음을 한 줄로 펼침

  // 임시 도구: 수정·삭제를 각 쪽 안에서 적용
  const setPosts = (update: (prev: Post[]) => Post[]) =>
    queryClient.setQueryData<InfiniteData<Post[], number>>(
      ['posts'],
      (old) => old && { ...old, pages: old.pages.map(update) },
    );
  // 생성: 서버에 주문 → 성공하면 냉장고 목록 맨 앞에 추가
  const createMutation = useMutation({
    mutationFn: createPost,
    onMutate: () => setError(null),
    onSuccess: (created) => {
      // JSONPlaceholder는 항상 id 101을 돌려주므로 로컬에서 고유 id 부여
      queryClient.setQueryData<InfiniteData<Post[], number>>(
        ['posts'],
        (old) =>
          old && {
            ...old,
            pages: [[{ ...created, id: Date.now() }, ...old.pages[0]], ...old.pages.slice(1)],
          },
      );
    },
    onError: (e) => setError(e.message),
  });

  // PostForm이 끝나길 기다리므로, 끝날 때까지 기다릴 수 있는 버전을 씀
  const handleCreate = async (data: PostInput) => {
    try {
      await createMutation.mutateAsync(data);
    } catch {
      // 에러 문구는 onError가 이미 화면에 띄움
    }
  };

  // 삭제: 서버에 주문 → 성공하면 냉장고 목록에서 제거
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (id <= 100) await deletePost(id); // 로컬 글은 서버 호출 불필요
    },
    onMutate: () => setError(null), // 주문 넣기 직전
    onSuccess: (_data, id) => {
      // 성공했을 때
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    onError: (e) => setError(e.message), // 실패했을 때
  });

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  // 수정: 서버에 주문 → 성공하면 냉장고 목록의 그 글만 바꿈
  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => updatePost(id, { title }),
    onMutate: () => setError(null),
    onSuccess: (updated, { id }) => {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    },
    onError: (e) => setError(e.message),
  });

  // 지금 수정 중인 글 번호 (처리 중이 아니면 null)
  const updatingId = updateMutation.isPending ? (updateMutation.variables?.id ?? null) : null;

  const handleUpdate = (id: number, title: string) => updateMutation.mutate({ id, title });

  const selectedPost = posts.find((p) => p.id === selectedId);

  return (
    <main className="app" id="main-content">
      <h1 className="app-title">REST 연습: Posts</h1>

      {/* 에러 안내: role="alert"로 즉시 읽어줌 */}
      {error && (
        <p role="alert" className="post-error">
          {error}
        </p>
      )}

      <PostForm onSubmit={handleCreate} />

      <div className="app-layout">
        <div aria-busy={isLoading} style={{ textAlign: 'center' }}>
          {isLoading && <p>목록 불러오는 중...</p>}
          {/* 목록 불러오기 실패 안내 */}
          {loadError && (
            <p role="alert" className="post-error">
              {loadError.message}
            </p>
          )}
          {/* 데이터가 있으면 목록 표시 (다음 쪽을 받다가 실패해도 목록은 유지) */}
          {data && (
            <>
              <PostList
                posts={posts}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                updatingId={updatingId}
              />
              {hasNextPage && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: '10px' }}
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  aria-busy={isFetchingNextPage}
                >
                  {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                </button>
              )}
            </>
          )}
        </div>
        {selectedId !== null && (
          <PostDetail key={selectedId} id={selectedId} fallback={selectedPost} />
        )}
      </div>
    </main>
  );
};

export default App;
