import React from "react";
const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;

const mockReplace = jest.fn();
const mockAuth = jest.fn();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn().mockResolvedValue(undefined);
jest.mock("expo-router", () => ({ router: { replace: (...args: unknown[]) => mockReplace(...args), push: jest.fn() } }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => mockAuth() }));
jest.mock("../lib/supabase", () => ({ supabase: {} }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

import MinhaConta from "../app/minha-conta";
import { CartProvider, useCart } from "../context/CartContext";

beforeEach(() => {
  jest.clearAllMocks();
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

test("does not send a restored account to login while auth is still loading", async () => {
  mockAuth.mockReturnValue({ user: null, loading: true, signOut: jest.fn() });
  let renderer: any;
  await act(async () => { renderer = TestRenderer.create(<MinhaConta />); });
  expect(mockReplace).not.toHaveBeenCalled();
  mockAuth.mockReturnValue({ user: null, loading: false, signOut: jest.fn() });
  await act(async () => { renderer.update(<MinhaConta />); });
  expect(mockReplace).toHaveBeenCalledWith("/login");
  await act(async () => renderer.unmount());
});

test("does not overwrite the saved cart before storage hydration finishes", async () => {
  let finishRead!: (value: string) => void;
  mockGetItem.mockReturnValue(new Promise<string>((resolve) => { finishRead = resolve; }));
  let items: unknown;
  function Observer() { items = useCart().items; return null; }
  let renderer: any;
  await act(async () => { renderer = TestRenderer.create(<CartProvider><Observer /></CartProvider>); });
  expect(mockSetItem).not.toHaveBeenCalled();
  const saved = [{ slug: "peca", title: "Peça", image: "https://example.com/p.jpg", priceCents: 1200, quantity: 2 }];
  await act(async () => { finishRead(JSON.stringify(saved)); });
  expect(items).toEqual(saved);
  expect(mockSetItem).toHaveBeenCalledWith("@clube-wpi3d/cart", JSON.stringify(saved));
  await act(async () => renderer.unmount());
});
