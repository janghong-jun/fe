import axios from 'axios';

// JSONPlaceholder REST API 래퍼
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res, // 성공한 응답은 그대로 통과
  (error) => {
    // 취소는 에러가 아니므로 건드리지 않고 그대로 돌려보냄
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const message = status ? `요청 실패 (HTTP ${status})` : '네트워크 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  },
);

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type PostInput = Omit<Post, 'id'>;

// R: 목록 조회 (GET /posts)
export const getPosts = async (signal?: AbortSignal, page = 1) => {
  const res = await api.get<Post[]>('/posts', {
    params: { _page: page, _limit: 10 },
    signal,
  });
  return res.data;
};
// R: 단건 조회 (GET /posts/:id)
export const getPost = async (id: number, signal?: AbortSignal) => {
  const res = await api.get<Post>(`/posts/${id}`, { signal });
  return res.data;
};
// C: 생성 (POST /posts) → 201 + 생성된 객체 반환
export const createPost = async (data: PostInput) => {
  const res = await api.post<Post>('/posts', data);
  return res.data;
};

// D: 삭제 (DELETE /posts/:id) → 200 + 빈 객체
export const deletePost = async (id: number) => {
  const res = await api.delete<Record<string, never>>(`/posts/${id}`);
  return res.data;
};

// U: 일부 수정 (PATCH /posts/:id)
export const updatePost = async (id: number, data: Partial<PostInput>) => {
  const res = await api.patch<Post>(`/posts/${id}`, data);
  return res.data;
};
