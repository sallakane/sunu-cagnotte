const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const AUTH_TOKEN_HEADER = "X-Auth-Token";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getApiValidationMessages(error: unknown): string[] {
  if (!(error instanceof ApiError)) {
    return [];
  }

  const body = error.body as { errors?: unknown } | null;

  if (!body || typeof body !== "object" || !body.errors || typeof body.errors !== "object") {
    return [];
  }

  return Object.values(body.errors).filter(
    (value): value is string => typeof value === "string" && value.trim() !== "",
  );
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: JSON_HEADERS.Accept,
      ...(isFormData ? {} : { "Content-Type": JSON_HEADERS["Content-Type"] }),
      ...(token ? { [AUTH_TOKEN_HEADER]: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const parsedBody = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof parsedBody === "object" &&
      parsedBody !== null &&
      typeof (parsedBody as { message?: unknown }).message === "string"
        ? parsedBody.message
        : typeof parsedBody === "string" && parsedBody.trim() !== ""
          ? parsedBody
          : response.status === 401
            ? "Votre session a expire. Reconnectez-vous puis reessayez."
            : response.status === 403
              ? "Vous n avez pas les droits pour effectuer cette action."
              : response.status === 404
                ? "La ressource demandee est introuvable."
                : response.status === 413
                  ? "Le fichier est trop volumineux pour etre telecharge."
                  : response.status >= 500
                    ? "Le serveur a rencontre une erreur. Reessayez dans quelques instants."
                    : "Une erreur est survenue.";

    throw new ApiError(message, response.status, parsedBody);
  }

  return parsedBody as T;
}
