const mapDbReply = ({
  comment_id, is_deleted, content, ...rest
}) => ({
  commentId: comment_id, content: is_deleted ? '**balasan telah dihapus**' : content, ...rest,
});

const mapDbComment = ({
  is_deleted, content, ...rest
}) => ({
  content: is_deleted ? '**komentar telah dihapus**' : content, ...rest,
});

module.exports = { mapDbReply, mapDbComment };
