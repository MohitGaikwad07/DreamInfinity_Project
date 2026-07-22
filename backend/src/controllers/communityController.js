import { Community, CommunityBookmark, CommunityComment, CommunityFollow, CommunityPost, CommunityReport, CommunityVote } from '../models/Community.js';
import { AppError } from '../utils/AppError.js';
import { grantXp, rewards } from '../services/gamificationService.js';
const populate = (query) => query.populate('author', 'name avatar xp level').sort({ votes: -1, createdAt: -1 });
export const feed = async (req, res, next) => { try { const { company, type, tag, search, result, difficulty } = req.query; const filter = { status: 'approved' }; if (company) filter.company = new RegExp(`^${company}$`, 'i'); if (type) filter.type = type; if (tag) filter.tags = tag.toLowerCase(); if (result) filter.result = result; if (difficulty) filter.difficulty = difficulty; if (search) filter.$text = { $search: search }; const posts = await populate(CommunityPost.find(filter).limit(50)); res.json({ success: true, posts }); } catch (error) { next(error); } };
export const createPost = async (req, res, next) => { try { const post = await CommunityPost.create({ ...req.body, author: req.user.id, tags: (req.body.tags || []).map((tag) => tag.toLowerCase()) }); await grantXp(req.user, rewards.communityPost); res.status(201).json({ success: true, post: await CommunityPost.findById(post.id).populate('author', 'name avatar xp level') }); } catch (error) { next(error); } };
export const company = async (req, res, next) => { try { const name = req.params.company; const [profile, posts, questions] = await Promise.all([Community.findOne({ slug: name.toLowerCase() }), populate(CommunityPost.find({ company: new RegExp(`^${name}$`, 'i'), status: 'approved' }).limit(30)), CommunityPost.find({ company: new RegExp(`^${name}$`, 'i'), type: 'question', status: 'approved' }).sort({ votes: -1 }).limit(10)]); res.json({ success: true, company: profile || { name, slug: name.toLowerCase(), overview: `Interview preparation hub for ${name}.`, topics: [] }, posts, questions }); } catch (error) { next(error); } };
export const comments = async (req, res, next) => { try { res.json({ success: true, comments: await CommunityComment.find({ post: req.params.postId, isDeleted: false }).populate('author', 'name avatar xp').sort({ createdAt: 1 }) }); } catch (error) { next(error); } };
export const createComment = async (req, res, next) => { try { const comment = await CommunityComment.create({ ...req.body, author: req.user.id }); await CommunityPost.findByIdAndUpdate(req.body.post, { $inc: { commentCount: 1 } }); await grantXp(req.user, rewards.communityAnswer); res.status(201).json({ success: true, comment: await CommunityComment.findById(comment.id).populate('author', 'name avatar xp') }); } catch (error) { next(error); } };
export const vote = async (req, res, next) => { try { const { targetType, target, value } = req.body; const Model = targetType === 'post' ? CommunityPost : CommunityComment; const existing = await CommunityVote.findOne({ user: req.user.id, targetType, target }); let delta = value; if (existing) { delta = existing.value === value ? -value : value * 2; if (existing.value === value) await existing.deleteOne(); else { existing.value = value; await existing.save(); } } else await CommunityVote.create({ user: req.user.id, targetType, target, value }); const item = await Model.findByIdAndUpdate(target, { $inc: { votes: delta, ...(value === 1 ? { helpfulCount: Math.max(0, delta) } : {}) } }, { new: true }); if (!item) throw new AppError('Community item not found.', 404); if (value === 1 && delta > 0 && String(item.author) !== String(req.user.id)) { const author = await User.findById(item.author); if (author) { await grantXp(author, rewards.communityUpvote); await grantXp(author, rewards.helpingUsers); } } res.json({ success: true, votes: item.votes }); } catch (error) { next(error); } };
export const bookmark = async (req, res, next) => { try { const { targetType = 'post', target } = req.body; const found = await CommunityBookmark.findOne({ user: req.user.id, targetType, target }); if (found) { await found.deleteOne(); if (targetType === 'post') await CommunityPost.findByIdAndUpdate(target, { $inc: { bookmarkCount: -1 } }); return res.json({ success: true, bookmarked: false }); } await CommunityBookmark.create({ user: req.user.id, targetType, target }); if (targetType === 'post') await CommunityPost.findByIdAndUpdate(target, { $inc: { bookmarkCount: 1 } }); return res.json({ success: true, bookmarked: true }); } catch (error) { next(error); } };
export const bookmarks = async (req, res, next) => { try { const rows = await CommunityBookmark.find({ user: req.user.id, targetType: 'post' }).sort({ createdAt: -1 }); const posts = await CommunityPost.find({ _id: { $in: rows.map((row) => row.target) } }).populate('author', 'name avatar xp'); res.json({ success: true, posts }); } catch (error) { next(error); } };
export const follow = async (req, res, next) => { try { const { targetType, target } = req.body; const found = await CommunityFollow.findOne({ user: req.user.id, targetType, target }); if (found) { await found.deleteOne(); return res.json({ success: true, following: false }); } await CommunityFollow.create({ user: req.user.id, targetType, target }); res.json({ success: true, following: true }); } catch (error) { next(error); } };
export const report = async (req, res, next) => { try { await CommunityReport.create({ ...req.body, reporter: req.user.id }); res.status(201).json({ success: true, message: 'Report submitted for moderation.' }); } catch (error) { next(error); } };
export const insights = async (_req, res, next) => { try { const tags = await CommunityPost.aggregate([{ $match: { status: 'approved' } }, { $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]); res.json({ success: true, insight: { sampleSize: await CommunityPost.countDocuments({ status: 'approved' }), topics: tags.map((item) => ({ name: item._id, count: item.count })), summary: 'AI analysis updates from verified community contributions and shared interview experiences.' } }); } catch (error) { next(error); } };

export const updatePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, author: req.user.id });
    if (!post) throw new AppError('Post not found or unauthorized.', 404);

    const { title, content, tags, company, role, experienceLevel, difficulty, result, location, salary } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags.map(t => t.toLowerCase());
    if (company !== undefined) post.company = company;
    if (role !== undefined) post.role = role;
    if (experienceLevel !== undefined) post.experienceLevel = experienceLevel;
    if (difficulty !== undefined) post.difficulty = difficulty;
    if (result !== undefined) post.result = result;
    if (location !== undefined) post.location = location;
    if (salary !== undefined) post.salary = salary;

    await post.save();
    return res.status(200).json({ success: true, post: await CommunityPost.findById(post.id).populate('author', 'name avatar xp level') });
  } catch (error) {
    return next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!post) throw new AppError('Post not found or unauthorized.', 404);

    await CommunityComment.deleteMany({ post: post._id });
    await CommunityBookmark.deleteMany({ targetType: 'post', target: post._id });
    await CommunityVote.deleteMany({ targetType: 'post', target: post._id });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await CommunityComment.findOne({ _id: req.params.id, author: req.user.id });
    if (!comment) throw new AppError('Comment not found or unauthorized.', 404);

    if (req.body.body !== undefined) comment.body = req.body.body;
    await comment.save();

    return res.status(200).json({ success: true, comment: await CommunityComment.findById(comment.id).populate('author', 'name avatar xp') });
  } catch (error) {
    return next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await CommunityComment.findOne({ _id: req.params.id, author: req.user.id });
    if (!comment) throw new AppError('Comment not found or unauthorized.', 404);

    comment.isDeleted = true;
    await comment.save();

    await CommunityPost.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
