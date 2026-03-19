import "@testing-library/jest-dom/vitest";
import { beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { clearStorageCache } from "@/lib/storage";

// ResizeObserver polyfill for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.clear();
  clearStorageCache();
  document.documentElement.classList.remove("dark");
});
