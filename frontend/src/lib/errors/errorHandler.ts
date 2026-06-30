type ApiErrorData = {
  detail?: unknown;
  message?: unknown;
  [key: string]: unknown;
};

type ApiError = {
  response?: {
    data?: ApiErrorData | string;
  };
};

const fallbackMessage = 'An unexpected error occurred. Please try again.';

function isApiError(error: unknown): error is ApiError {
  return Boolean(error && typeof error === 'object' && 'response' in error);
}

function getFirstValidationMessage(data: ApiErrorData): string | undefined {
  const firstValue = Object.values(data)[0];

  if (Array.isArray(firstValue) && firstValue[0]) {
    return String(firstValue[0]);
  }

  if (typeof firstValue === 'string') {
    return firstValue;
  }

  return undefined;
}

export function parseApiError(error: unknown): string {
  if (!isApiError(error)) {
    return fallbackMessage;
  }

  const data = error.response?.data;

  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  return getFirstValidationMessage(data) ?? fallbackMessage;
}