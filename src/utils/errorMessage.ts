import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import type { ApiErrorBody } from '../types/error';

const pickFirstText = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = pickFirstText(item);
      if (text) return text;
    }
  }

  if (typeof value === 'object' && value !== null) {
    for (const nestedValue of Object.values(value)) {
      const text = pickFirstText(nestedValue);
      if (text) return text;
    }
  }

  return null;
};

const getMessageFromData = (data: unknown): string | null => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const payload = data as ApiErrorBody;

    const directMessage =
      pickFirstText(payload.message) ??
      pickFirstText(payload.error) ??
      pickFirstText(payload.detail) ??
      pickFirstText(payload.title) ??
      pickFirstText(payload.errors);

    if (directMessage) {
      return directMessage;
    }
  }

  return null;
};

export const getApiErrorMessage = (
  err: FetchBaseQueryError | SerializedError | unknown,
  fallbackMessage: string
) => {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const apiError = err as FetchBaseQueryError & { data?: unknown };

    if (apiError.status === 'FETCH_ERROR') {
      return 'Network error. Please check your internet connection.';
    }
    if (apiError.status === 'TIMEOUT_ERROR') {
      return 'Request timeout. Please try again.';
    }
    if (apiError.status === 'PARSING_ERROR') {
      return 'Server returned invalid response. Please try again later.';
    }

    const messageFromData = getMessageFromData(apiError.data);
    if (messageFromData) {
      return messageFromData;
    }
  }

  if (typeof err === 'object' && err !== null && 'data' in err) {
    const messageFromData = getMessageFromData((err as { data?: unknown }).data);
    if (messageFromData) {
      return messageFromData;
    }
  }

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const rawMessage = (err as { message?: unknown }).message;
    const normalizedMessage = pickFirstText(rawMessage);
    if (normalizedMessage) {
      return normalizedMessage;
    }
  }

  return fallbackMessage;
};
