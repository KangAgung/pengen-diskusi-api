class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParam, useCaseAuth) {
    const { id: owner } = useCaseAuth;

    await this._replyRepository.findReplyById(useCaseParam.replyId);
    await this._replyRepository.verifyReplyOwnership({ owner, replyId: useCaseParam.replyId });
    await this._replyRepository.deleteReplyById(useCaseParam.replyId);
  }
}

module.exports = DeleteReplyUseCase;
