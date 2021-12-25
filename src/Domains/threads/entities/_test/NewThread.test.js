const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'A thread',
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: {},
      owner: 123,
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title is longer than 50 character', () => {
    // Arrange
    const payload = {
      title: 'pada hari minggu ku turut ayah ke kota, naik delman istimewa ku duduk di muka, ku duduk samping pak kusir',
      body: 'ini adalah sebuah utas',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'A thread',
      body: 'ini adalah sebuah utas',
      owner: 'user-123',
    };

    // Action
    const { title, body, owner } = new NewThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
