const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should create new thread and return thread correctly', async () => {
      // arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const newThread = new NewThread({
        title: 'a thread',
        body: 'content from thread',
      });

      const idGen = () => '123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool, idGen,
      );

      // action
      const addedThread = await threadRepositoryPostgres.addThread(newThread, 'user-123');
      const threads = await ThreadsTableTestHelper.findThreadById(addedThread.id);

      // assert
      expect(threads).toHaveLength(1);
      expect(threads[0].body).toEqual(newThread.body);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: newThread.title,
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      // arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      // assert
      await expect(threadRepositoryPostgres.getThreadById('thread-x')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread when thread is found', async () => {
      // arrange
      const newThread = {
        id: 'thread-123', title: 'a thread', body: 'content from thread', owner: 'user-123', date: new Date('2021-08-08T07:59:48.766Z'),
      };

      const expectedThread = {
        id: 'thread-123',
        title: 'a thread',
        date: new Date('2021-08-08T07:59:48.766Z'),
        username: 'Dicoding',
        body: 'content from thread',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: expectedThread.username });
      await ThreadsTableTestHelper.addThread(newThread);

      // action
      const acquiredThread = await threadRepositoryPostgres.getThreadById('thread-123');

      // assert
      expect(acquiredThread).toStrictEqual(expectedThread);
    });
  });
});
