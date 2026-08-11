# API-слой (аналог RTK Query)

Лёгкий аналог [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) для этого проекта: кастомный store + hooks без React и без Redux Toolkit.

Позволяет описывать REST-эндпоинты декларативно, получать кэш, статусы загрузки/ошибок, хуки `useQuery` / `useMutation` и инвалидацию по тегам.

---

## Зачем это нужно

В проекте уже есть свой Flux/Redux-подобный store. Вручную писать для каждого запроса:

- `pending` / `fulfilled` / `rejected` actions,
- кэш по аргументам,
- флаги `isLoading` / `error`,
- повторный fetch после мутаций,

быстро превращается в копипасту.

Этот слой даёт тот же DX, что RTK Query, но поверх существующей архитектуры (`createStore`, `useSelector`, `useState`).

---

## Структура файлов

```
src/api/
  createApi.js           # фабрика API: кэш, теги, хуки, initiate
  fetchBaseQuery.js      # обёртка над fetch (baseUrl, headers, JSON)
  serializeQueryArgs.js  # стабильный ключ кэша endpoint + args
  api.js                 # пример/боевой API slice проекта
  index.js               # публичные экспорты

src/store/
  index.js               # rootReducer: app-поля + state.api
  instance.js            # get/set store (без циклических импортов)
```

Документация: `docs/api-layer.md` (этот файл).

---

## Как это встроено в store

Поля приложения (`lang`, `currentStep`, `email`, …) остаются **плоскими** в корне state — существующие селекторы не ломаются.

Рядом появляется slice API:

```js
{
  lang: "en",
  currentStep: "fullReg",
  email: "",
  // ...
  api: {
    queries: {},      // кэш query по ключу
    mutations: {},    // результаты mutation
    provided: {},     // связь tag → cacheKeys (для invalidation)
  }
}
```

`rootReducer` в `src/store/index.js`:

1. прогоняет app-часть через `appReducer`;
2. прогоняет `state.api` через `api.reducer`;
3. склеивает результат: `{ ...nextApp, api: nextApi }`.

После `createStore` вызывается `setStoreInstance(store)`, чтобы хуки и `initiate` могли делать `dispatch` / `getState` без циклических импортов `api ↔ store`.

---

## Быстрый старт

### 1. Описание API (`src/api/api.js`)

```js
import { createApi } from "./createApi.js";
import { fetchBaseQuery } from "./fetchBaseQuery.js";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders(headers) {
      // headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Countries", "Session"],
  endpoints: (build) => ({
    getCountries: build.query({
      query: () => "/countries",
      providesTags: ["Countries"],
    }),
    register: build.mutation({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),
  }),
});
```

### 2. Query в компоненте / виджете

```js
import { api } from "../../api/index.js";

export const CountriesBlock = () => {
  const { data, error, isLoading, isFetching, refetch } =
    api.useGetCountriesQuery();

  const el = document.createElement("div");

  if (isLoading) {
    el.textContent = "Loading…";
    return el;
  }

  if (error) {
    el.textContent = `Error: ${error.status}`;
    return el;
  }

  el.textContent = JSON.stringify(data);
  // refetch() — принудительно перезапросить
  return el;
};
```

Имя хука генерируется автоматически:

- endpoint `getCountries` → `api.useGetCountriesQuery`
- endpoint `register` → `api.useRegisterMutation`

Также доступны:

- `api.endpoints.getCountries.useQuery`
- `api.useLazyGetCountriesQuery` / `api.endpoints.getCountries.useLazyQuery`

### 3. Mutation

```js
import { api } from "../../api/index.js";

export const RegisterButton = () => {
  const [register, { isLoading, isSuccess, error, data, reset }] =
    api.useRegisterMutation();

  const el = document.createElement("button");
  el.textContent = isLoading ? "…" : "Register";
  el.disabled = isLoading;

  el.addEventListener("click", async () => {
    const result = await register({
      email: "user@example.com",
      password: "Secret1!",
    });

    if (result.error) {
      console.error(result.error);
      return;
    }

    console.log("created", result.data);
  });

  return el;
};
```

### 4. Императивный вызов (без хука)

```js
import { api } from "./api/index.js";

// query
const { data, error } = await api.endpoints.getCountries.initiate();

// mutation
await api.endpoints.register.initiate({ email, password });

 // force refetch даже если есть fulfilled-кэш
await api.endpoints.getCountries.initiate(undefined, { forceRefetch: true });
```

---

## `createApi` — опции

| Опция | Тип | Описание |
|--------|-----|----------|
| `reducerPath` | `string` | Ключ в root state. По умолчанию `"api"`. |
| `baseQuery` | `function` | Функция запроса (обычно `fetchBaseQuery(...)`). |
| `tagTypes` | `string[]` | Список типов тегов (для документации/паритета с RTKQ). |
| `endpoints` | `(build) => object` | Фабрика эндпоинтов через `build.query` / `build.mutation`. |

### `build.query(definition)`

| Поле | Описание |
|------|----------|
| `query` | `(args) => string \| RequestArgs` — URL или объект запроса. |
| `providesTags` | Теги, которые «предоставляет» этот query (массив или функция). |
| `extraOptions` | Доп. опции, прокидываются третьим аргументом в `baseQuery`. |

### `build.mutation(definition)`

| Поле | Описание |
|------|----------|
| `query` | `(args) => string \| RequestArgs`. |
| `invalidatesTags` | После успешной мутации инвалидирует queries с этими тегами и делает refetch. |

Формат тега:

```js
"User"
// или
{ type: "User", id: 5 }
```

`providesTags` / `invalidatesTags` могут быть функцией:

```js
providesTags: (result, error, id) => [{ type: "User", id }],
invalidatesTags: (result, error, arg) => ["User"],
```

---

## `fetchBaseQuery`

```js
fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders(headers, { getState }) {
    return headers;
  },
  fetchFn: fetch, // можно подменить (тесты, моки)
})
```

Аргумент `query` у endpoint может быть:

```js
// строка
query: () => "/countries"

// объект
query: (id) => ({
  url: `/users/${id}`,
  method: "GET",
  params: { include: "profile" }, // → ?include=profile
  headers: { "X-Custom": "1" },
  body: { name: "Ann" },          // JSON, Content-Type ставится сам
})
```

Ответ `baseQuery`:

```js
{ data }           // успех
{ error: { status, data } }          // HTTP !ok
{ error: { status: "FETCH_ERROR", error } } // сеть/исключение
```

---

## Хуки и возвращаемые значения

### `useXxxQuery(args, options?)`

```js
const {
  data,
  error,
  isUninitialized, // запроса ещё не было
  isLoading,       // первый pending без data
  isFetching,      // любой pending
  isSuccess,
  isError,
  refetch,         // () => Promise — forceRefetch
} = api.useGetUserQuery(userId, { skip: !userId });
```

Поведение:

- при первом рендере (нет кэша) ставит запрос в очередь через `queueMicrotask`;
- если в кэше уже `pending` или `fulfilled` — повторно не ходит в сеть;
- при `rejected` на следующем рендере пробует снова;
- `skip: true` — не запускает запрос.

### `useLazyXxxQuery()`

```js
const [trigger, result] = api.useLazyGetUserQuery();

await trigger(userId);
// result: те же поля, что у useQuery
```

### `useXxxMutation(options?)`

```js
const [trigger, {
  data,
  error,
  isUninitialized,
  isLoading,
  isSuccess,
  isError,
  reset, // сбросить локальную привязку к результату
}] = api.useRegisterMutation();

// опционально общий ключ кэша мутации:
api.useRegisterMutation({ fixedCacheKey: "signup-form" });
```

---

## Кэш

Ключ кэша query: `serializeQueryArgs(endpointName, args)`.

Примеры:

| Вызов | Ключ |
|-------|------|
| `getCountries()` | `getCountries` |
| `getUser(5)` | `getUser(5)` |
| `getUser({ id: 5 })` | `getUser({"id":5})` |

Объекты сериализуются со **сортировкой ключей**, чтобы `{a:1,b:2}` и `{b:2,a:1}` дали один ключ.

Запись в `state.api.queries[cacheKey]`:

```js
{
  endpointName,
  originalArgs,
  requestId,
  status: "pending" | "fulfilled" | "rejected",
  data,
  error,
  startedTimeStamp,
  fulfilledTimeStamp,
}
```

Пока идёт новый запрос, предыдущий `data` сохраняется (удобно для UI без мигания).

Если пришёл ответ со старым `requestId` (гонка) — он игнорируется.

---

## Теги и инвалидация

1. Query с `providesTags: ["User"]` регистрирует свой `cacheKey` в `state.api.provided`.
2. Mutation с `invalidatesTags: ["User"]` после успеха:
   - находит все queries с этим тегом (и с `User:id`, если инвалидировали тип целиком);
   - делает им `forceRefetch`.

Вручную:

```js
api.util.invalidateTags(["Countries"]);
api.util.invalidateTags([{ type: "User", id: 5 }]);
api.util.resetApiState(); // очистить весь api-slice
```

---

## Селекторы и endpoints API

```js
// результат конкретного query из store
const selectUser = api.endpoints.getUser.select(5);
const entry = selectUser(store.getState());

// всё, что сгенерировано для endpoint
api.endpoints.getUser.initiate
api.endpoints.getUser.select
api.endpoints.getUser.useQuery
api.endpoints.getUser.useLazyQuery

api.endpoints.register.initiate
api.endpoints.register.useMutation
```

---

## Типичный сценарий регистрации

```js
// src/api/api.js
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "https://example.com/api" }),
  tagTypes: ["Session"],
  endpoints: (build) => ({
    register: build.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Session"],
    }),
    getSession: build.query({
      query: () => "/auth/session",
      providesTags: ["Session"],
    }),
  }),
});
```

В виджете:

```js
const [register, registerState] = api.useRegisterMutation();
const session = api.useGetSessionQuery(undefined, {
  skip: !registerState.isSuccess,
});

// после register → Session инвалидируется → getSession перезапросится
```

---

## Связь с жизненным циклом UI

В проекте полный re-render идёт через `store.subscribe` → `render()` → `resetHooks()` → новый DOM.

Поэтому:

- когда query переходит в `pending` / `fulfilled` / `rejected`, store обновляется → UI перерисовывается;
- `useQuery` снова читает кэш через `useSelector`;
- повторный сетевой вызов не стартует, пока кэш в `pending`/`fulfilled`.

Исключение: в `main.js` часть actions (например `SET_EMAIL`) может быть отфильтрована из полного re-render — API-actions туда не входят, статусы запросов всегда триггерят обновление.

---

## Чего нет (намеренно упрощено относительно RTKQ)

- нет middleware / `createAsyncThunk` — async живёт внутри `initiate`;
- нет `onQueryStarted` / optimistic update helpers из коробки;
- нет `pollingInterval`, `refetchOnFocus`, `refetchOnReconnect`;
- нет code-splitting `injectEndpoints` (можно добавить позже);
- нет TypeScript-generics из RTK Query;
- `tagTypes` сейчас в основном для паритета API, runtime на них не завязан жёстко.

Если понадобится что-то из этого списка — логичное место расширения: `createApi.js`.

---

## Чеклист: добавить новый endpoint

1. Открыть `src/api/api.js`.
2. Добавить `build.query` или `build.mutation`.
3. При необходимости расширить `tagTypes` и проставить `providesTags` / `invalidatesTags`.
4. В UI вызвать `api.useXxxQuery` / `api.useXxxMutation` или `api.endpoints.xxx.initiate`.
5. Убедиться, что `baseUrl` и `prepareHeaders` соответствуют бэкенду.

Подключать новый `createApi(...)` в store **не нужно**, если пользуетесь уже смонтированным `api` из `src/api/api.js`.  
Если создаёте второй slice — добавьте его reducer в `rootReducer` рядом с текущим `api.reducer`.

---

## Импорты

```js
import {
  api,              // готовый slice проекта
  createApi,        // фабрика
  fetchBaseQuery,   // base query
  serializeQueryArgs,
} from "../api/index.js";
```
