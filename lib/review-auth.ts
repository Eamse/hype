import bcrypt from 'bcryptjs';

// 이 리뷰(또는 댓글)를 수정/삭제할 권한이 있는지 확인
// 어드민 → 무조건 허용
// 회원 → 세션 아이디가 작성자와 같은지
// 비회원 → 전달받은 password가 저장된 해시와 맞는지
export async function canModifyReview(
  owned: { userId: string | null; password: string | null },
  session: { user?: { id?: string | null; role?: string | null } } | null,
  password: unknown,
): Promise<boolean> {
  if (session?.user?.role === 'admin') return true;
  if (owned.userId) {
    return owned.userId === session?.user?.id;
  }
  if (typeof password !== 'string' || !owned.password) return false;
  return bcrypt.compare(password, owned.password);
}
