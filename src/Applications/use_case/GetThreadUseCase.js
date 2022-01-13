class getThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParam) {
    const threadDetail = await this._threadRepository.getThreadById(useCaseParam.threadId);
    let threadComments = await this._commentRepository.getCommentsByThreadId(useCaseParam.threadId);
    let threadReplies = await this._replyRepository.getRepliesByThreadId(useCaseParam.threadId);

    threadComments = await this._getLikeCountComments(threadComments);
    threadComments = await this._checkDeletedComments(threadComments);
    threadReplies = await this._checkDeletedReplies(threadReplies);
    threadDetail.comments = await this._mapRepliesForComments(threadComments, threadReplies);

    return threadDetail;
  }

  async _checkDeletedComments(comments) {
    return comments.map(({ is_deleted, content, ...rest }) => ({
      content: is_deleted ? '**komentar telah dihapus**' : content,
      ...rest,
    }));
  }

  async _checkDeletedReplies(replies) {
    return replies.map(({ is_deleted, content, ...rest }) => ({
      content: is_deleted ? '**balasan telah dihapus**' : content,
      ...rest,
    }));
  }

  async _mapRepliesForComments(comments, replies) {
    return comments.map((comment) => {
      const newComment = comment;
      newComment.replies = replies
        .filter((reply) => (reply.comment_id === newComment.id))
        .map(({ comment_id, ...rest }) => ({ ...rest }));
      return newComment;
    });
  }

  async _getLikeCountComments(comments) {
    for (const comment of comments) {
      /* eslint-disable no-await-in-loop */
      comment.likeCount = await this._likeRepository.getLikeCount(comment.id);
    }
    return comments;
  }
}

module.exports = getThreadUseCase;
