import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as community from '../../services/communityService.js';

const failure = (error) => error?.response?.data?.message || error?.message || 'Community operation failed.';

export const loadFeed = createAsyncThunk('community/feed', async (filters, { rejectWithValue }) => {
  try {
    return (await community.getFeed(filters)).data.posts;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const loadBookmarks = createAsyncThunk('community/loadBookmarks', async (_, { rejectWithValue }) => {
  try {
    return (await community.getBookmarks()).data.posts;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const publishPost = createAsyncThunk('community/post', async (data, { rejectWithValue }) => {
  try {
    return (await community.createPost(data)).data.post;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const editPost = createAsyncThunk('community/editPost', async ({ id, data }, { rejectWithValue }) => {
  try {
    return (await community.updatePost(id, data)).data.post;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const removePost = createAsyncThunk('community/deletePost', async (id, { rejectWithValue }) => {
  try {
    await community.deletePost(id);
    return id;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const votePost = createAsyncThunk('community/vote', async (data, { rejectWithValue }) => {
  try {
    return { id: data.target, votes: (await community.vote({ targetType: 'post', ...data })).data.votes };
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const toggleBookmark = createAsyncThunk('community/bookmark', async (target, { rejectWithValue }) => {
  try {
    return { target, ...(await community.bookmark({ targetType: 'post', target })).data };
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const loadInsights = createAsyncThunk('community/insights', async (_, { rejectWithValue }) => {
  try {
    return (await community.getInsights()).data.insight;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const loadComments = createAsyncThunk('community/loadComments', async (postId, { rejectWithValue }) => {
  try {
    return (await community.getComments(postId)).data.comments;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const publishComment = createAsyncThunk('community/publishComment', async (data, { rejectWithValue }) => {
  try {
    return (await community.createComment(data)).data.comment;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const editComment = createAsyncThunk('community/editComment', async ({ id, data }, { rejectWithValue }) => {
  try {
    return (await community.updateComment(id, data)).data.comment;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const removeComment = createAsyncThunk('community/deleteComment', async (id, { rejectWithValue }) => {
  try {
    await community.deleteComment(id);
    return id;
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

const slice = createSlice({
  name: 'community',
  initialState: {
    posts: [],
    comments: [],
    filters: {},
    insight: null,
    loading: false,
    commentsLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadBookmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(loadBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(publishPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(editPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(removePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      })
      .addCase(votePost.fulfilled, (state, action) => {
        const post = state.posts.find((row) => row._id === action.payload.id);
        if (post) post.votes = action.payload.votes;
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const post = state.posts.find((row) => row._id === action.payload.target);
        if (post) {
          post.bookmarked = action.payload.bookmarked;
          post.bookmarkCount = (post.bookmarkCount || 0) + (action.payload.bookmarked ? 1 : -1);
        }
      })
      .addCase(loadInsights.fulfilled, (state, action) => {
        state.insight = action.payload;
      })
      .addCase(loadComments.pending, (state) => {
        state.commentsLoading = true;
        state.comments = [];
      })
      .addCase(loadComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(loadComments.rejected, (state) => {
        state.commentsLoading = false;
      })
      .addCase(publishComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        const post = state.posts.find((p) => p._id === action.payload.post);
        if (post) post.commentCount = (post.commentCount || 0) + 1;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        const comment = state.comments.find((c) => c._id === action.payload);
        if (comment) {
          comment.isDeleted = true;
          comment.body = '[This comment has been deleted by the author]';
        }
        if (comment) {
          const post = state.posts.find((p) => p._id === comment.post);
          if (post) post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
        }
      });
  }
});

export const { setFilters } = slice.actions;
export default slice.reducer;
