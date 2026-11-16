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
  type PostSortOrder,
} from '@/api/posts';
import PostList from '@/components/PostList';
import PostDetail from '@/components/PostDetail';
import PostForm from '@/components/PostForm';

const App = () => {
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sortOrder, setSortOrder] = useState<PostSortOrder>('desc');
  const queryClient = useQueryClient();
  const postsQueryKey = ['posts', sortOrder] as const;

  // 목록: 정렬 기준별로 쪽 단위 캐시에 쌓음
  const {
    data,
    error: loadError,
    isLoading,
    fetchNextPage, // 다음 쪽을 받아 오는 함수
    hasNextPage, // 다음 쪽이 더 있는지
    isFetchingNextPage, // 다음 쪽을 받아 오는 중인지
  } = useInfiniteQuery({
    queryKey: postsQueryKey,
    queryFn: ({ signal, pageParam }) => getPosts(signal, pageParam, sortOrder),
    initialPageParam: 1, // 처음엔 1쪽부터
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 10 ? lastPageParam + 1 : undefined,
  });
  const posts = data?.pages.flat() ?? []; // 쪽별 묶음을 한 줄로 펼침

  // 임시 도구: 수정·삭제를 각 쪽 안에서 적용
  const setPosts = (update: (prev: Post[]) => Post[]) =>
    queryClient.setQueryData<InfiniteData<Post[], number>>(
      postsQueryKey,
      (old) => old && { ...old, pages: old.pages.map(update) },
    );
  // 생성: 서버에 저장한 뒤 정렬 기준에 맞는 목록을 다시 조회
  const createMutation = useMutation({
    mutationFn: createPost,
    onMutate: () => setError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (e) => setError(e.message),
  });

  // 삭제: 서버에 주문 → 성공하면 냉장고 목록에서 제거
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onMutate: () => setError(null),
    onSuccess: async (_data, id) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
      if (editingId === id) {
        setEditingId(null);
        setTitle('');
        setBody('');
      }
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (e) => setError(e.message),
  });

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  // 수정: 서버에 주문 → 성공하면 냉장고 목록의 그 글만 바꿈
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PostInput }) => updatePost(id, data),
    onMutate: () => setError(null),
    onSuccess: async (updated, { id }) => {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      queryClient.setQueryData<Post>(['post', id], updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post', id] }),
      ]);
    },
    onError: (e) => setError(e.message),
  });

  // 지금 수정 중인 글 번호 (처리 중이 아니면 null)
  const updatingId = updateMutation.isPending ? (updateMutation.variables?.id ?? null) : null;
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
  };
  const handleSubmit = async (data: PostInput) => {
    try {
      if (editingId === null) {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync({ id: editingId, data });
      }
      resetForm();
    } catch {
      // Mutation error handlers display the error while preserving the form values.
    }
  };
  const handleSelect = (id: number) => {
    setSelectedId(id);
  };
  const handleEdit = (id: number) => {
    const post = posts.find((post) => post.id === id);

    if (!post) return;

    setEditingId(post.id);
    setTitle(post.title);
    setBody(post.body);
  };
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

      <PostForm
        title={title}
        body={body}
        isEditing={editingId !== null}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      <div className="app-layout">
        <div aria-busy={isLoading}>
          <div style={{ textAlign: 'right' }}>
            <label className="post-sort-control">
              정렬 기준
              <select
                value={sortOrder}
                onChange={(event) => {
                  const order = event.target.value;
                  if (order === 'asc' || order === 'desc') setSortOrder(order);
                }}
              >
                <option value="desc">최신순</option>
                <option value="asc">오래된순</option>
              </select>
            </label>
          </div>
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
                updatingId={updatingId}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onUpdate={handleEdit}
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
