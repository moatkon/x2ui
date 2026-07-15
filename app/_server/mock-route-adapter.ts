import type { NextRequest } from "next/server";
import { handleMockGet, handleMockMutation } from "./mock-api";
export const mockGet = (segments: string[]) => (request: NextRequest) => handleMockGet(request, segments);
export const mockPost = (segments: string[]) => (request: NextRequest) => handleMockMutation(request, segments, "POST");
export const mockPut = (segments: string[]) => (request: NextRequest) => handleMockMutation(request, segments, "PUT");
export const mockPatch = (segments: string[]) => (request: NextRequest) => handleMockMutation(request, segments, "PATCH");
export const mockDelete = (segments: string[]) => (request: NextRequest) => handleMockMutation(request, segments, "DELETE");
