const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating add thread action correctly', async () => {
    // arrange
    const useCaseAuth = {
      id: 'user-123',
    };
    const useCasePayload = {
      title: 'a thread',
      body: 'content from a thread',
    };
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCaseAuth.id,
    });

    const expectedNewThread = new NewThread(useCasePayload);

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // action
    const addedThread = await addThreadUseCase.execute(useCasePayload, useCaseAuth);

    // assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(expectedNewThread, useCaseAuth.id);
  });
});
