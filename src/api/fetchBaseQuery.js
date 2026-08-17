export function fetchBaseQuery({
  baseUrl = "",
  prepareHeaders,
  fetchFn = fetch,
} = {}) {
  return async (args, { getState } = {}) => {
    const request = typeof args === "string" ? { url: args } : { ...args };
    const {
      url,
      method = "GET",
      body,
      headers: requestHeaders = {},
      params,
      ...rest
    } = request;

    let headers = new Headers(requestHeaders);

    if (prepareHeaders) {
      headers =
        (await prepareHeaders(headers, { getState })) ?? headers;
    }

    if (
      body != null &&
      !(body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    const queryString = params ? buildQueryString(params) : "";
    const fullUrl = `${baseUrl}${url}${queryString}`;

    try {
      const response = await fetchFn(fullUrl, {
        method,
        headers,
        body:
          body == null || body instanceof FormData || typeof body === "string"
            ? body
            : JSON.stringify(body),
        ...rest,
      });

      const text = await response.text();
      let data = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!response.ok) {
        return {
          error: {
            status: response.status,
            data,
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          status: "FETCH_ERROR",
          error: String(error),
        },
      };
    }
  };
}

function buildQueryString(params) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
      return;
    }

    search.set(key, String(value));
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
