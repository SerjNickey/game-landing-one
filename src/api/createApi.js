import { useState } from "../hooks/useState.js";
import { useSelector } from "../hooks/useSelector.js";
import { getStoreInstance } from "../store/instance.js";
import { serializeQueryArgs } from "./serializeQueryArgs.js";

const initialApiState = {
  queries: {},
  mutations: {},
  provided: {},
};

let requestCounter = 0;

function nextRequestId() {
  requestCounter += 1;
  return String(requestCounter);
}

function getStore() {
  return getStoreInstance();
}

function normalizeTags(tags, result, error, args) {
  if (!tags) return [];

  const resolved =
    typeof tags === "function" ? tags(result, error, args) : tags;

  return (resolved ?? [])
    .map((tag) => {
      if (typeof tag === "string") return { type: tag, id: undefined };
      if (tag && typeof tag === "object" && tag.type) {
        return { type: tag.type, id: tag.id };
      }
      return null;
    })
    .filter(Boolean);
}

function tagKey(tag) {
  return tag.id === undefined ? tag.type : `${tag.type}:${tag.id}`;
}

/**
 * Lightweight RTK Query analog for the custom store.
 *
 * @example
 * const api = createApi({
 *   reducerPath: "api",
 *   baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
 *   tagTypes: ["User"],
 *   endpoints: (build) => ({
 *     getUser: build.query({
 *       query: (id) => `/users/${id}`,
 *       providesTags: ["User"],
 *     }),
 *     createUser: build.mutation({
 *       query: (body) => ({ url: "/users", method: "POST", body }),
 *       invalidatesTags: ["User"],
 *     }),
 *   }),
 * });
 */
export function createApi({
  reducerPath = "api",
  baseQuery,
  tagTypes = [],
  endpoints,
}) {
  const endpointDefs = {};

  const builder = {
    query(definition) {
      return { ...definition, type: "query" };
    },
    mutation(definition) {
      return { ...definition, type: "mutation" };
    },
  };

  const defined = endpoints(builder);

  Object.entries(defined).forEach(([name, definition]) => {
    endpointDefs[name] = definition;
  });

  const actionTypes = {
    pending: `${reducerPath}/pending`,
    fulfilled: `${reducerPath}/fulfilled`,
    rejected: `${reducerPath}/rejected`,
    invalidateTags: `${reducerPath}/invalidateTags`,
    reset: `${reducerPath}/reset`,
    removeQueryResult: `${reducerPath}/removeQueryResult`,
  };

  function reducer(state = initialApiState, action) {
    switch (action.type) {
      case actionTypes.pending: {
        const { kind, cacheKey, requestId, endpointName, originalArgs } =
          action.payload;
        const collection = kind === "query" ? "queries" : "mutations";
        const prev = state[collection][cacheKey];

        return {
          ...state,
          [collection]: {
            ...state[collection],
            [cacheKey]: {
              endpointName,
              originalArgs,
              requestId,
              status: "pending",
              data: prev?.data,
              error: undefined,
              startedTimeStamp: Date.now(),
              fulfilledTimeStamp: prev?.fulfilledTimeStamp,
            },
          },
        };
      }

      case actionTypes.fulfilled: {
        const {
          kind,
          cacheKey,
          requestId,
          data,
          endpointName,
          originalArgs,
          providesTags,
        } = action.payload;

        const collection = kind === "query" ? "queries" : "mutations";
        const entry = state[collection][cacheKey];

        if (entry && entry.requestId !== requestId) {
          return state;
        }

        let nextProvided = state.provided;

        if (kind === "query") {
          nextProvided = updateProvidedTags(
            state.provided,
            cacheKey,
            providesTags,
          );
        }

        return {
          ...state,
          provided: nextProvided,
          [collection]: {
            ...state[collection],
            [cacheKey]: {
              endpointName,
              originalArgs,
              requestId,
              status: "fulfilled",
              data,
              error: undefined,
              startedTimeStamp: entry?.startedTimeStamp,
              fulfilledTimeStamp: Date.now(),
            },
          },
        };
      }

      case actionTypes.rejected: {
        const {
          kind,
          cacheKey,
          requestId,
          error,
          endpointName,
          originalArgs,
        } = action.payload;

        const collection = kind === "query" ? "queries" : "mutations";
        const entry = state[collection][cacheKey];

        if (entry && entry.requestId !== requestId) {
          return state;
        }

        return {
          ...state,
          [collection]: {
            ...state[collection],
            [cacheKey]: {
              endpointName,
              originalArgs,
              requestId,
              status: "rejected",
              data: entry?.data,
              error,
              startedTimeStamp: entry?.startedTimeStamp,
              fulfilledTimeStamp: Date.now(),
            },
          },
        };
      }

      case actionTypes.removeQueryResult: {
        const { cacheKey } = action.payload;
        if (!state.queries[cacheKey]) return state;

        const { [cacheKey]: _removed, ...restQueries } = state.queries;

        return {
          ...state,
          queries: restQueries,
          provided: removeCacheKeyFromProvided(state.provided, cacheKey),
        };
      }

      case actionTypes.invalidateTags:
        return state;

      case actionTypes.reset:
        return initialApiState;

      default:
        return state;
    }
  }

  function selectSlice(rootState) {
    return rootState?.[reducerPath] ?? initialApiState;
  }

  function selectQueryResult(cacheKey) {
    return (rootState) => selectSlice(rootState).queries[cacheKey];
  }

  async function runEndpoint({
    endpointName,
    kind,
    args,
    forceRefetch = false,
    fixedCacheKey,
  }) {
    const store = getStore();
    const definition = endpointDefs[endpointName];

    if (!definition) {
      throw new Error(`Unknown endpoint: ${endpointName}`);
    }

    const cacheKey =
      kind === "mutation" && fixedCacheKey
        ? `${endpointName}(${fixedCacheKey})`
        : kind === "mutation"
          ? `${endpointName}/${nextRequestId()}`
          : serializeQueryArgs(endpointName, args);

    const current =
      kind === "query"
        ? selectSlice(store.getState()).queries[cacheKey]
        : undefined;

    if (
      kind === "query" &&
      !forceRefetch &&
      current &&
      (current.status === "pending" || current.status === "fulfilled")
    ) {
      return {
        data: current.data,
        error: current.error,
        cacheKey,
        requestId: current.requestId,
      };
    }

    const requestId = nextRequestId();

    store.dispatch({
      type: actionTypes.pending,
      payload: {
        kind,
        cacheKey,
        requestId,
        endpointName,
        originalArgs: args,
      },
    });

    const queryArg =
      typeof definition.query === "function"
        ? definition.query(args)
        : definition.query;

    const extraOptions = definition.extraOptions ?? {};

    const result = await baseQuery(
      queryArg,
      {
        getState: store.getState,
        dispatch: store.dispatch,
        endpoint: endpointName,
        type: kind,
        forced: forceRefetch,
      },
      extraOptions,
    );

    if (result.error) {
      store.dispatch({
        type: actionTypes.rejected,
        payload: {
          kind,
          cacheKey,
          requestId,
          endpointName,
          originalArgs: args,
          error: result.error,
        },
      });

      return { error: result.error, cacheKey, requestId };
    }

    const providesTags = normalizeTags(
      definition.providesTags,
      result.data,
      undefined,
      args,
    );

    store.dispatch({
      type: actionTypes.fulfilled,
      payload: {
        kind,
        cacheKey,
        requestId,
        endpointName,
        originalArgs: args,
        data: result.data,
        providesTags,
      },
    });

    if (kind === "mutation") {
      const tagsToInvalidate = normalizeTags(
        definition.invalidatesTags,
        result.data,
        undefined,
        args,
      );

      if (tagsToInvalidate.length > 0) {
        await invalidateTags(tagsToInvalidate);
      }
    }

    return { data: result.data, cacheKey, requestId };
  }

  function findCacheKeysForTags(tags) {
    const slice = selectSlice(getStore().getState());
    const keys = new Set();

    tags.forEach((tag) => {
      if (tag.id === undefined) {
        Object.entries(slice.provided).forEach(([key, cacheKeys]) => {
          if (key === tag.type || key.startsWith(`${tag.type}:`)) {
            cacheKeys.forEach((cacheKey) => keys.add(cacheKey));
          }
        });
        return;
      }

      const entries = slice.provided[tagKey(tag)];
      if (!entries) return;
      entries.forEach((cacheKey) => keys.add(cacheKey));
    });

    return [...keys];
  }

  async function invalidateTags(tags) {
    const normalized = normalizeTags(tags);
    if (normalized.length === 0) return;

    getStore().dispatch({
      type: actionTypes.invalidateTags,
      payload: { tags: normalized },
    });

    const cacheKeys = findCacheKeysForTags(normalized);
    const slice = selectSlice(getStore().getState());

    await Promise.all(
      cacheKeys.map((cacheKey) => {
        const entry = slice.queries[cacheKey];
        if (!entry) return null;

        return runEndpoint({
          endpointName: entry.endpointName,
          kind: "query",
          args: entry.originalArgs,
          forceRefetch: true,
        });
      }),
    );
  }

  function createQueryHook(endpointName) {
    return function useQuery(args, options = {}) {
      const { skip = false } = options;
      const cacheKey = serializeQueryArgs(endpointName, args);
      const result = useSelector(selectQueryResult(cacheKey));

      const shouldFetch = !skip && (!result || result.status === "rejected");

      if (shouldFetch) {
        queueMicrotask(() => {
          void runEndpoint({ endpointName, kind: "query", args });
        });
      }

      return mapQueryResult(result, () =>
        runEndpoint({
          endpointName,
          kind: "query",
          args,
          forceRefetch: true,
        }),
      );
    };
  }

  function createLazyQueryHook(endpointName) {
    return function useLazyQuery() {
      const [cacheKey, setCacheKey] = useState(null);
      const result = useSelector((state) =>
        cacheKey ? selectSlice(state).queries[cacheKey] : undefined,
      );

      const trigger = (args, options = {}) =>
        runEndpoint({
          endpointName,
          kind: "query",
          args,
          forceRefetch: options.forceRefetch,
        }).then((response) => {
          setCacheKey(response.cacheKey);
          return response;
        });

      return [
        trigger,
        mapQueryResult(result, () =>
          result
            ? runEndpoint({
                endpointName,
                kind: "query",
                args: result.originalArgs,
                forceRefetch: true,
              })
            : Promise.resolve({ data: undefined }),
        ),
      ];
    };
  }

  function createMutationHook(endpointName) {
    return function useMutation(options = {}) {
      const { fixedCacheKey } = options;
      const [cacheKey, setCacheKey] = useState(
        fixedCacheKey ? `${endpointName}(${fixedCacheKey})` : null,
      );

      const result = useSelector((state) =>
        cacheKey ? selectSlice(state).mutations[cacheKey] : undefined,
      );

      const trigger = (args) =>
        runEndpoint({
          endpointName,
          kind: "mutation",
          args,
          fixedCacheKey,
        }).then((response) => {
          setCacheKey(response.cacheKey);
          return response;
        });

      const reset = () => {
        setCacheKey(null);
      };

      return [trigger, { ...mapMutationResult(result), reset }];
    };
  }

  const api = {
    reducerPath,
    reducer,
    util: {
      invalidateTags,
      resetApiState() {
        getStore().dispatch({ type: actionTypes.reset });
      },
    },
    endpoints: {},
  };

  Object.keys(endpointDefs).forEach((endpointName) => {
    const definition = endpointDefs[endpointName];
    const isQuery = definition.type === "query";

    api.endpoints[endpointName] = {
      name: endpointName,
      initiate: (args, options = {}) =>
        runEndpoint({
          endpointName,
          kind: isQuery ? "query" : "mutation",
          args,
          forceRefetch: options.forceRefetch,
          fixedCacheKey: options.fixedCacheKey,
        }),
      select: isQuery
        ? (args) => selectQueryResult(serializeQueryArgs(endpointName, args))
        : undefined,
      useQuery: isQuery ? createQueryHook(endpointName) : undefined,
      useLazyQuery: isQuery ? createLazyQueryHook(endpointName) : undefined,
      useMutation: !isQuery ? createMutationHook(endpointName) : undefined,
    };

    const hookName = `use${capitalize(endpointName)}${
      isQuery ? "Query" : "Mutation"
    }`;
    api[hookName] = isQuery
      ? api.endpoints[endpointName].useQuery
      : api.endpoints[endpointName].useMutation;

    if (isQuery) {
      api[`useLazy${capitalize(endpointName)}Query`] =
        api.endpoints[endpointName].useLazyQuery;
    }
  });

  void tagTypes;

  return api;
}

function mapQueryResult(result, refetch) {
  const status = result?.status;
  const isUninitialized = !result;
  const isLoading = status === "pending" && result?.data === undefined;
  const isFetching = status === "pending";
  const isSuccess = status === "fulfilled";
  const isError = status === "rejected";

  return {
    data: result?.data,
    error: result?.error,
    isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    refetch,
  };
}

function mapMutationResult(result) {
  const status = result?.status;

  return {
    data: result?.data,
    error: result?.error,
    isUninitialized: !result,
    isLoading: status === "pending",
    isSuccess: status === "fulfilled",
    isError: status === "rejected",
  };
}

function updateProvidedTags(provided, cacheKey, tags) {
  const next = { ...provided };

  Object.keys(next).forEach((key) => {
    next[key] = next[key].filter((item) => item !== cacheKey);
    if (next[key].length === 0) {
      delete next[key];
    }
  });

  tags.forEach((tag) => {
    const key = tagKey(tag);
    const list = next[key] ? [...next[key]] : [];
    if (!list.includes(cacheKey)) list.push(cacheKey);
    next[key] = list;
  });

  return next;
}

function removeCacheKeyFromProvided(provided, cacheKey) {
  const next = { ...provided };

  Object.keys(next).forEach((key) => {
    next[key] = next[key].filter((item) => item !== cacheKey);
    if (next[key].length === 0) {
      delete next[key];
    }
  });

  return next;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
