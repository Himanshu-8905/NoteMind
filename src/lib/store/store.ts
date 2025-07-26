import { configureStore } from "@reduxjs/toolkit";
import SelectedFilesReducer from "./slices/selectedFolderSlice";

export const createStore = () => {
  return configureStore({
    reducer: { SelectedFiles: SelectedFilesReducer },
  });
};

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
