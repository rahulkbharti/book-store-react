// store.ts
import {
  configureStore,
  combineReducers,
  type Reducer,
  type Action,
  type Middleware,
} from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistConfig,
} from "redux-persist";
import { encryptTransform } from "redux-persist-transform-encrypt";
import {
  createStateSyncMiddleware,
  withReduxStateSync,
} from "redux-state-sync";

import authReducer from "./slice/authSlice";
import type { PersistPartial } from "redux-persist/es/persistReducer";

// Root state type
export interface RootState {
  auth: ReturnType<typeof authReducer>;
}

// App dispatch type
export type AppDispatch = ReturnType<typeof createAppStore>["dispatch"];

// Sync config
const syncConfig = {
  blacklist: [PERSIST, REHYDRATE],
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
});

// Persist config
const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [
    encryptTransform({
      secretKey: "fallback-secret-key",
      onError: (err: Error) => {
        console.error("Redux encryption error:", err);
      },
    }),
  ],
};

// Create the store with proper typing
export const createAppStore = () => {
  const syncedReducer = withReduxStateSync(
    rootReducer as Reducer<RootState, Action>
  );
  const persistedReducer = persistReducer(persistConfig, syncedReducer);

  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(
        createStateSyncMiddleware(syncConfig) as Middleware<
          {},
          RootState & PersistPartial
        >
      ),
    devTools: true,
  });
};

export const store = createAppStore();
export const persistor = persistStore(store);
