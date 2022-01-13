class PutLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParam, useCaseAuth) {
    const { threadId, commentId } = useCaseParam;
    const { id: owner } = useCaseAuth;

    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.findCommentById(commentId);
    const like = await this._likeRepository.getLikeByCommentIdAndOwner({ commentId, owner });

    if (like.length) {
      await this._likeRepository.removeLike(like[0].id);
    } else {
      await this._likeRepository.addLike({ commentId, owner });
    }
  }
}

module.exports = PutLikeUseCase;
