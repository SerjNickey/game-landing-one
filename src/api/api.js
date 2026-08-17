import { createApi } from "./createApi.js";
import { fetchBaseQuery } from "./fetchBaseQuery.js";

/**
 * API slice for the landing — add endpoints as game / content needs appear.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.plnpw.com/api/web/",
    prepareHeaders(headers) {
      return headers;
    },
  }),
  tagTypes: [],
  endpoints: () => ({}),
});
