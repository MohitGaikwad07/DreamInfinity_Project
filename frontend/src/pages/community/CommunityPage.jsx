import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiArrowDown, 
  FiArrowUp, 
  FiBookmark, 
  FiClock, 
  FiEdit3, 
  FiFilter, 
  FiMessageSquare, 
  FiSearch, 
  FiStar, 
  FiX, 
  FiTrash2, 
  FiSend 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { 
  loadFeed, 
  loadBookmarks, 
  loadInsights, 
  publishPost, 
  editPost, 
  removePost, 
  setFilters, 
  toggleBookmark, 
  votePost,
  loadComments,
  publishComment,
  editComment,
  removeComment
} from '../../redux/slices/communitySlice.js';

const types = ['All', 'Experience', 'Question', 'Discussion', 'Article', 'Guide'];
const tags = ['React', 'Node', 'Python', 'DSA', 'System Design', 'SQL', 'HR'];

const time = (date) => {
  const hours = Math.max(1, Math.round((Date.now() - new Date(date)) / 36e5));
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

export const CommunityPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { posts, comments, insight, loading, commentsLoading, filters } = useSelector((state) => state.community);
  
  // Modals and sidebars
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // Post object to edit
  const [selectedPost, setSelectedPost] = useState(null); // Post details / comments sidebar
  
  const [query, setQuery] = useState('');
  
  // Forms
  const [form, setForm] = useState({ type: 'experience', title: '', content: '', company: '', role: '', tags: '' });
  const [editForm, setEditForm] = useState({ title: '', content: '', tags: '' });
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState('');

  useEffect(() => {
    if (filters.bookmarked) {
      dispatch(loadBookmarks());
    } else {
      dispatch(loadFeed(filters));
    }
    dispatch(loadInsights());
  }, [dispatch, filters]);

  const filter = (next) => dispatch(setFilters(next));

  const submit = async (event) => {
    event.preventDefault();
    const action = await dispatch(publishPost({ 
      ...form, 
      tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean) 
    }));
    if (publishPost.fulfilled.match(action)) {
      toast.success('Your contribution is live!');
      setModal(false);
      setForm({ type: 'experience', title: '', content: '', company: '', role: '', tags: '' });
    } else {
      toast.error(action.payload || 'Could not publish your post.');
    }
  };

  const handleEditPost = (post) => {
    setEditModal(post);
    setEditForm({
      title: post.title,
      content: post.content,
      tags: post.tags?.join(', ') || ''
    });
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editModal) return;
    const action = await dispatch(editPost({
      id: editModal._id,
      data: {
        ...editForm,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      }
    }));
    if (editPost.fulfilled.match(action)) {
      toast.success('Post updated successfully!');
      setEditModal(null);
    } else {
      toast.error(action.payload || 'Could not update post.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;
    const action = await dispatch(removePost(postId));
    if (removePost.fulfilled.match(action)) {
      toast.success('Post removed.');
      if (selectedPost?._id === postId) setSelectedPost(null);
    } else {
      toast.error('Could not delete post.');
    }
  };

  // Comments / Replies logic
  const handleOpenReplies = (post) => {
    setSelectedPost(post);
    dispatch(loadComments(post._id));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;
    const action = await dispatch(publishComment({
      post: selectedPost._id,
      body: newComment
    }));
    if (publishComment.fulfilled.match(action)) {
      toast.success('Reply posted!');
      setNewComment('');
    } else {
      toast.error('Could not submit reply.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment reply?')) return;
    const action = await dispatch(removeComment(commentId));
    if (removeComment.fulfilled.match(action)) {
      toast.success('Comment deleted.');
    } else {
      toast.error('Could not delete comment.');
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentBody(comment.body);
  };

  const saveEditComment = async (commentId) => {
    if (!editCommentBody.trim()) return;
    const action = await dispatch(editComment({
      id: commentId,
      data: { body: editCommentBody }
    }));
    if (editComment.fulfilled.match(action)) {
      toast.success('Comment updated.');
      setEditingCommentId(null);
    } else {
      toast.error('Could not update comment.');
    }
  };

  return (
    <div className="community-page relative">
      <section className="community-hero">
        <div>
          <p className="dash-kicker">DREAM INFINITY COMMUNITY</p>
          <h1>Prepare together. <span>Get hired smarter.</span></h1>
          <p>Real interview intelligence from candidates, mentors, and professionals — organized around the companies you care about.</p>
        </div>
        <button className="community-create" onClick={() => setModal(true)}>
          <FiEdit3 /> Share with the community
        </button>
      </section>

      <div className="community-layout">
        <aside className="community-left">
          <b>Explore</b>
          <button className={(!filters.type && !filters.bookmarked) ? 'selected' : ''} onClick={() => filter({})}>
            For you
          </button>
          <button className={filters.bookmarked ? 'selected' : ''} onClick={() => filter({ bookmarked: true })}>
            Bookmarked posts
          </button>
          <button className={filters.type === 'experience' ? 'selected' : ''} onClick={() => filter({ type: 'experience' })}>
            Interview experiences
          </button>
          <button className={filters.type === 'question' ? 'selected' : ''} onClick={() => filter({ type: 'question' })}>
            Question bank
          </button>
          <button className={filters.type === 'discussion' ? 'selected' : ''} onClick={() => filter({ type: 'discussion' })}>
            Discussions
          </button>
          <hr />
          <b>Popular tags</b>
          {tags.map((tag) => (
            <button key={tag} onClick={() => filter({ tag: tag.toLowerCase() })}>
              # {tag}
            </button>
          ))}
        </aside>

        <main className="community-feed">
          <div className="community-toolbar">
            <div className="community-search">
              <FiSearch />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && filter({ search: query })} 
                placeholder="Search companies, questions, experiences"
              />
            </div>
            <button className="filter-button"><FiFilter /> Filters</button>
          </div>

          <div className="community-tabs">
            {types.map((type) => (
              <button 
                className={(type === 'All' && !filters.type) || filters.type === type.toLowerCase() ? 'tab-active' : ''} 
                key={type} 
                onClick={() => filter(type === 'All' ? {} : { type: type.toLowerCase() })}
              >
                {type}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="community-empty">Loading community intelligence…</div>
          ) : posts.length ? (
            posts.map((post) => {
              const isOwnPost = post.author?._id === user?._id || post.author === user?._id;
              return (
                <article className="post-card" key={post._id}>
                  <div className="vote-rail">
                    <button onClick={() => dispatch(votePost({ target: post._id, value: 1 }))}><FiArrowUp /></button>
                    <b>{post.votes}</b>
                    <button onClick={() => dispatch(votePost({ target: post._id, value: -1 }))}><FiArrowDown /></button>
                  </div>
                  <div className="post-content">
                    <header>
                      <div className="post-avatar">{post.author?.name?.[0] || 'D'}</div>
                      <div>
                        <b>{post.author?.name || 'Dream Infinity member'}</b>
                        <small>{time(post.createdAt)}</small>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span className={`post-type type-${post.type}`}>{post.type}</span>
                        {isOwnPost && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleEditPost(post)}
                              className="text-[10px] bg-white/5 border border-white/8 hover:bg-white/10 text-gray-300 rounded px-2 py-1 font-bold transition"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post._id)}
                              className="text-[10px] bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/25 text-rose-300 rounded p-1 transition"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
                      </div>
                    </header>

                    {post.company && (
                      <button className="company-chip" onClick={() => filter({ company: post.company })}>
                        {post.company}{post.role ? ` · ${post.role}` : ''}
                      </button>
                    )}

                    <h2 
                      className="cursor-pointer hover:text-violet-300 transition" 
                      onClick={() => handleOpenReplies(post)}
                    >
                      {post.title}
                    </h2>
                    <p>{post.content}</p>
                    
                    <div className="tag-row">
                      {post.tags?.map((tag) => (
                        <button key={tag} onClick={() => filter({ tag })}>#{tag}</button>
                      ))}
                    </div>

                    <footer>
                      <button onClick={() => handleOpenReplies(post)}>
                        <FiMessageSquare /> {post.commentCount || 0} replies
                      </button>
                      <button className={post.bookmarked ? 'bookmarked' : ''} onClick={() => dispatch(toggleBookmark(post._id))}>
                        <FiBookmark /> {post.bookmarkCount || 0}
                      </button>
                      <span>
                        <FiClock /> {post.result !== 'not_applicable' ? post.result.replace('_', ' ') : 'Community verified'}
                      </span>
                    </footer>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="community-empty">No posts match these filters. Be the first to share useful interview insight.</div>
          )}
        </main>

        <aside className="community-right">
          <section className="ai-insight">
            <div>
              <FiStar />
              <span>AI COMMUNITY INSIGHT</span>
            </div>
            <h3>What candidates are seeing now</h3>
            <p>{insight?.sampleSize || 0} shared experiences analyzed. These topics are gaining momentum.</p>
            <div className="insight-tags">
              {insight?.topics?.slice(0, 5).map((item) => (
                <span key={item.name}>{item.name} <b>{item.count}</b></span>
              )) || <span>Preparing insights…</span>}
            </div>
            <button onClick={() => filter({ type: 'experience' })}>Explore interview patterns →</button>
          </section>

          <section className="trending-card">
            <p className="dash-kicker">TRENDING COMPANIES</p>
            {['Amazon', 'Google', 'Microsoft', 'Adobe', 'Infosys'].map((company, index) => (
              <button key={company} onClick={() => filter({ company })}>
                <span>0{index + 1}</span>
                <b>{company}</b>
                <small>{80 - index * 9} new posts</small>
              </button>
            ))}
          </section>

          <section className="contribute-card">
            <b>Build your community reputation</b>
            <p>Share an experience or answer a question to help others in their prep.</p>
            <button onClick={() => setModal(true)}>Contribute now</button>
          </section>
        </aside>
      </div>

      {/* Creation Modal */}
      {modal && (
        <div className="community-modal">
          <form onSubmit={submit}>
            <button type="button" className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            <p className="dash-kicker">CREATE A CONTRIBUTION</p>
            <h2>Help the next candidate.</h2>
            <div className="form-grid">
              <label>Post type
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="experience">Interview experience</option>
                  <option value="question">Question</option>
                  <option value="discussion">Discussion</option>
                  <option value="article">Article</option>
                  <option value="guide">Preparation guide</option>
                  <option value="tip">Preparation tip</option>
                </select>
              </label>
              <label>Company
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Amazon" />
              </label>
            </div>
            <label>Title
              <input required minLength="4" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Give your post a clear, useful title" />
            </label>
            <label>Details
              <textarea required minLength="10" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Share the questions, rounds, learnings, or your doubt…" />
            </label>
            <div className="form-grid">
              <label>Role
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Frontend engineer" />
              </label>
              <label>Tags
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, DSA, System Design" />
              </label>
            </div>
            <button className="community-create" type="submit">Publish contribution</button>
          </form>
        </div>
      )}

      {/* Edit Post Modal */}
      {editModal && (
        <div className="community-modal">
          <form onSubmit={submitEdit}>
            <button type="button" className="modal-close" onClick={() => setEditModal(null)}><FiX /></button>
            <p className="dash-kicker">MODIFY CONTRIBUTION</p>
            <h2>Edit your post.</h2>
            <label>Title
              <input required minLength="4" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </label>
            <label>Details
              <textarea required minLength="10" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows="8" />
            </label>
            <label>Tags
              <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="React, DSA" />
            </label>
            <button className="community-create mt-4" type="submit">Save Changes</button>
          </form>
        </div>
      )}

      {/* Replies Sliding Side Panel Overlay */}
      {selectedPost && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#110f1c] border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between animate-slideIn">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-400">Post Intelligence & Replies</p>
                <h3 className="text-base font-bold text-white truncate max-w-xs">{selectedPost.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1 pb-4">
              {/* Post Details card */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex gap-2 items-center mb-2">
                  <div className="h-6 w-6 rounded-full bg-violet-600 font-black text-center text-xs flex items-center justify-center">
                    {selectedPost.author?.name?.[0] || 'F'}
                  </div>
                  <span className="text-xs font-bold text-white">{selectedPost.author?.name || 'Member'}</span>
                  <span className="text-[9px] text-gray-500 ml-auto">{time(selectedPost.createdAt)}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{selectedPost.title}</h4>
                <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
              </div>

              {/* Replies Header */}
              <h4 className="text-xs font-black uppercase tracking-wider text-violet-400 mt-6 mb-2">Comments & Answers</h4>

              {/* Comments List */}
              <div className="space-y-3">
                {commentsLoading ? (
                  <div className="text-xs text-violet-300 font-bold">Loading comments...</div>
                ) : comments.length ? (
                  comments.map((comment) => {
                    const isOwnComment = comment.author?._id === user?._id || comment.author === user?._id;
                    return (
                      <div key={comment._id} className="bg-white/2 border border-white/5 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {comment.author?.name?.[0] || 'D'}
                          </div>
                          <span className="text-xs font-semibold text-white">{comment.author?.name || 'Dream Infinity member'}</span>
                          <span className="text-[9px] text-gray-500 ml-auto">{time(comment.createdAt)}</span>
                        </div>

                        {editingCommentId === comment._id ? (
                          <div className="space-y-2">
                            <textarea 
                              value={editCommentBody} 
                              onChange={(e) => setEditCommentBody(e.target.value)}
                              className="w-full bg-black/30 border border-white/10 rounded-lg text-xs text-white p-2 outline-none focus:border-violet-500"
                              rows="3"
                            />
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setEditingCommentId(null)}
                                className="text-[10px] text-gray-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => saveEditComment(comment._id)}
                                className="text-[10px] bg-violet-600 text-white rounded px-2.5 py-1 font-bold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-300 leading-relaxed">{comment.body}</p>
                        )}

                        {isOwnComment && !comment.isDeleted && editingCommentId !== comment._id && (
                          <div className="flex gap-2 justify-end text-[10px]">
                            <button 
                              onClick={() => startEditComment(comment)}
                              className="text-gray-400 hover:text-white font-semibold"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-rose-400 hover:text-rose-500 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-gray-500 py-4 text-center">No replies yet. Be the first to answer.</div>
                )}
              </div>
            </div>
          </div>

          {/* Add Reply composer */}
          <form onSubmit={handleAddComment} className="border-t border-white/5 pt-4 flex gap-2">
            <input 
              required
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-violet-500 outline-none"
              placeholder="Type your helpful reply here..."
            />
            <button 
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 flex items-center justify-center transition"
            >
              <FiSend size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
