type CommentLike = {
  id: number;
  parentId: number | null;
  password?: string | null;
};

export type CommentNode<T> = Omit<T, 'password'> & { replies: CommentNode<T>[] };

// 리뷰 하나의 댓글을 한 번에 다 가져온 다음, parentId 기준으로 트리 조립 (쿼리는 1번만)
export function buildCommentTree<T extends CommentLike>(
  comments: T[],
): CommentNode<T>[] {
  const byId = new Map<number, CommentNode<T>>();
  for (const c of comments) {
    const { password: _password, ...rest } = c;
    byId.set(c.id, { ...rest, replies: [] } as CommentNode<T>);
  }

  const roots: CommentNode<T>[] = [];
  for (const node of byId.values()) {
    if (node.parentId) {
      byId.get(node.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
