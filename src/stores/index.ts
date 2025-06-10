import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./auth/authApi";
import { blogApi } from "../services/blogServices";
import { menuApi } from "../services/menuServices";
import { subjectApi } from "../services/subjectServices";
import { courseApi } from "../services/courseServices";
import { teacherApi } from "../services/teacherServices";
import { staffApi } from "../services/staffServices";
import { addressApi } from "../services/addressServices";
import { classApi } from "../services/classServices";
import { weekdayApi } from "../services/weekdayServices";
import consultantApi from "../services/consultantServices";
import { statisticalApi } from "../services/statisticalServices";
import authReducer from "./auth/authSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    [subjectApi.reducerPath]: subjectApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [consultantApi.reducerPath]: consultantApi.reducer,
    [weekdayApi.reducerPath]: weekdayApi.reducer,
    [statisticalApi.reducerPath]: statisticalApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      blogApi.middleware,
      menuApi.middleware,
      subjectApi.middleware,
      courseApi.middleware,
      teacherApi.middleware,
      staffApi.middleware,
      addressApi.middleware,
      classApi.middleware,
      weekdayApi.middleware,
      statisticalApi.middleware,
      consultantApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
