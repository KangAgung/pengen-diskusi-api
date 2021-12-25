const AddedThread = require('../AddedThread');

describe('AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'a thread',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'a thread',
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'a thread',
      owner: 'user-1234',
    };

    // Action
    const addedUser = new AddedThread(payload);

    // Assert
    expect(addedUser.id).toEqual(payload.id);
    expect(addedUser.title).toEqual(payload.title);
    expect(addedUser.owner).toEqual(payload.owner);
  });
});
