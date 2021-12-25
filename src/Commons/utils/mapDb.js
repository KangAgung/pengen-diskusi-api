const mapDbReply = ({ comment_id, is_deleted, ...rest }) => ({ commentId: comment_id, isDeleted: is_deleted, ...rest });

const mapDbComment = ({ is_deleted, ...rest }) => ({ isDeleted: is_deleted, ...rest });

module.exports = { mapDbReply, mapDbComment };
