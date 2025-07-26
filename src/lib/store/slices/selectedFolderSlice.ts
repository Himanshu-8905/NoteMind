import { createSlice } from "@reduxjs/toolkit";
import { Doc } from "../../../../convex/_generated/dataModel";

// Define a type for the slice state
export interface SelectedFilesState {
  files: Doc<"sourceCodeEmbedding">[];
}

// Define the initial state using that type
const initialState: SelectedFilesState = {
  files: [],
};

export const SelectedFilesSlice = createSlice({
  name: "SelectedFiles",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addFile: (state, action) => {
      if (!state.files.find((file) => file._id === action.payload._id)) {
        state.files.push(action.payload);
      }
    },
    removeFile: (state, action) => {
      state.files = state.files.filter(
        (file) => file._id !== action.payload._id
      );
    },
    resetStore: (state) => {
      state.files = [];
    },
  },
});

export const { addFile, removeFile, resetStore } = SelectedFilesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state;

export default SelectedFilesSlice.reducer;
