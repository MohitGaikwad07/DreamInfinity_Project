import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { codingService } from '../../services/codingService.js';

const fail = (error) => error?.errors?.[0]?.msg || error?.message || 'Coding service could not complete that action.';

const templates = {
  'two-sum': {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
    
}`,
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
    go: `func twoSum(nums []int, target int) []int {
    // Write your code here
    return nil
}`
  },
  'valid-parentheses': {
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your code here
    
}`,
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        pass`,
    java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`,
    cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
        return false;
    }
};`,
    go: `func isValid(s string) bool {
    // Write your code here
    return false
}`
  },
  'number-of-islands': {
    javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
    // Write your code here
    
}`,
    python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Write your code here
        pass`,
    java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your code here
        return 0;
    }
}`,
    cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Write your code here
        return 0;
    }
};`,
    go: `func numIslands(grid [][]byte) int {
    // Write your code here
    return 0
}`
  }
};

const getCodeTemplate = (questionId, language) => {
  return templates[questionId]?.[language] || `// Solution in ${language} for problem ${questionId}\n\n`;
};

export const loadCodingData = createAsyncThunk('coding/load', async (_, { rejectWithValue }) => { 
  try { 
    const [questions, history, leaderboard] = await Promise.all([
      codingService.questions(), 
      codingService.history(), 
      codingService.leaderboard()
    ]); 
    return { ...questions, ...history, ...leaderboard }; 
  } catch (error) { 
    return rejectWithValue(fail(error)); 
  } 
});

export const runCode = createAsyncThunk('coding/run', async (payload, { rejectWithValue }) => { 
  try { 
    return await codingService.run(payload); 
  } catch (error) { 
    return rejectWithValue(fail(error)); 
  } 
});

export const submitCode = createAsyncThunk('coding/submit', async (payload, { rejectWithValue }) => { 
  try { 
    return await codingService.submit(payload); 
  } catch (error) { 
    return rejectWithValue(fail(error)); 
  } 
});

const slice = createSlice({ 
  name: 'coding', 
  initialState: { 
    questions: [], 
    currentQuestion: null, 
    code: '// Write your solution here\n', 
    language: 'javascript', 
    mode: 'practice', 
    input: '', 
    result: null, 
    history: [], 
    leaderboard: [], 
    loading: false, 
    error: null 
  }, 
  reducers: { 
    selectQuestion: (state, action) => { 
      state.currentQuestion = action.payload; 
      state.result = null; 
      if (action.payload) {
        state.code = getCodeTemplate(action.payload.id, state.language);
      }
    }, 
    setCode: (state, action) => { 
      state.code = action.payload; 
    }, 
    setLanguage: (state, action) => { 
      state.language = action.payload; 
      if (state.currentQuestion) {
        state.code = getCodeTemplate(state.currentQuestion.id, action.payload);
      }
    }, 
    setInput: (state, action) => { 
      state.input = action.payload; 
    }, 
    setMode: (state, action) => { 
      state.mode = action.payload; 
    }, 
    clearCodingError: (state) => { 
      state.error = null; 
    } 
  }, 
  extraReducers: (builder) => builder
    .addCase(loadCodingData.pending, (state) => { 
      state.loading = true; 
    })
    .addCase(loadCodingData.fulfilled, (state, action) => { 
      state.loading = false; 
      state.questions = action.payload.questions; 
      const current = state.currentQuestion || action.payload.questions[0] || null;
      state.currentQuestion = current; 
      state.history = action.payload.submissions; 
      state.leaderboard = action.payload.leaderboard; 
      if (current && state.code.startsWith('// Write your solution')) {
        state.code = getCodeTemplate(current.id, state.language);
      }
    })
    .addCase(runCode.pending, (state) => { 
      state.loading = true; 
    })
    .addCase(runCode.fulfilled, (state, action) => { 
      state.loading = false; 
      state.result = action.payload.result; 
    })
    .addCase(submitCode.pending, (state) => { 
      state.loading = true; 
    })
    .addCase(submitCode.fulfilled, (state, action) => { 
      state.loading = false; 
      state.result = action.payload.submission.result; 
      state.history.unshift(action.payload.submission); 
    })
    .addMatcher((action) => action.type.startsWith('coding/') && action.type.endsWith('/rejected'), (state, action) => { 
      state.loading = false; 
      state.error = action.payload; 
    }) 
});

export const { selectQuestion, setCode, setLanguage, setInput, setMode, clearCodingError } = slice.actions;
export default slice.reducer;
