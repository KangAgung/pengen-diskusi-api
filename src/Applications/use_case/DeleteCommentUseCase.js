class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParam, useCaseAuth) {
    const { id: owner } = useCaseAuth;

    await this._commentRepository.findCommentById(useCaseParam.commentId);
    await this._commentRepository.verifyCommentOwnership({ commentId: useCaseParam.commentId, owner });
    await this._commentRepository.deleteCommentById(useCaseParam.commentId);
  }
}

module.exports = DeleteCommentUseCase;
