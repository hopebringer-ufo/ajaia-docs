import { describe, expect, it, vi, beforeEach } from "vitest";

import { renameDocumentSchema, shareDocumentSchema } from "@/lib/validations/document";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import {
  fileImportErrorMessage,
  markdownToHtml,
  plainTextToHtml,
  validateImportFile,
} from "@/utils/file-import";

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("auth validation", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "owner@example.com",
      password: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords on register", () => {
    const result = registerSchema.safeParse({
      fullName: "Owner",
      email: "owner@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("document validation", () => {
  it("rejects empty rename title", () => {
    const result = renameDocumentSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts valid share email", () => {
    const result = shareDocumentSchema.safeParse({ email: "editor@example.com" });
    expect(result.success).toBe(true);
  });
});

describe("file import", () => {
  it("rejects unsupported extensions", () => {
    const file = new File(["x"], "notes.pdf", { type: "application/pdf" });
    expect(validateImportFile(file)).toBe("unsupported_type");
    expect(fileImportErrorMessage("unsupported_type")).toMatch(/\.txt/);
  });

  it("rejects files over 5 MB", () => {
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    const file = new File([big], "big.txt", { type: "text/plain" });
    expect(validateImportFile(file)).toBe("too_large");
  });

  it("converts plain text to HTML paragraphs", () => {
    expect(plainTextToHtml("Hello\nworld")).toContain("<p>");
  });

  it("converts basic markdown", () => {
    const html = markdownToHtml("# Title\n\n- item");
    expect(html).toContain("<h1>");
    expect(html).toContain("<ul>");
  });
});

describe("document actions", () => {
  beforeEach(() => {
    mockCreateClient.mockReset();
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({
          data: { user: { id: "user-1", email: "owner@example.com" } },
          error: null,
        }),
      },
      from: vi.fn(),
    });
  });

  it("creates a document for the authenticated user", async () => {
    const inserted = {
      id: "doc-1",
      owner_id: "user-1",
      title: "Untitled document",
      content: "<p></p>",
      created_at: "",
      updated_at: "",
    };
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: inserted, error: null }),
        }),
      }),
    });
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({
          data: { user: { id: "user-1", email: "owner@example.com" } },
          error: null,
        }),
      },
      from,
    });

    const { createDocumentAction } = await import("@/app/actions/documents");
    const result = await createDocumentAction();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("doc-1");
    }
  });

  it("renames with validation failure", async () => {
    const { renameDocumentAction } = await import("@/app/actions/documents");
    const result = await renameDocumentAction("doc-1", "");
    expect(result.success).toBe(false);
  });

  it("deletes when authorized", async () => {
    const from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    });
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({
          data: { user: { id: "user-1", email: "owner@example.com" } },
          error: null,
        }),
      },
      from,
    });

    const { deleteDocumentAction } = await import("@/app/actions/documents");
    const result = await deleteDocumentAction("doc-1");
    expect(result.success).toBe(true);
  });
});

describe("share action", () => {
  beforeEach(() => {
    mockCreateClient.mockReset();
  });

  it("validates email before sharing", async () => {
    const { shareDocumentAction } = await import("@/app/actions/shares");
    const result = await shareDocumentAction("doc-1", "not-an-email");
    expect(result.success).toBe(false);
  });
});

describe("document content size", () => {
  it("rejects oversized HTML payloads", async () => {
    const { validateDocumentContentSize } = await import("@/utils/content");
    const huge = "a".repeat(5 * 1024 * 1024 + 1);
    expect(validateDocumentContentSize(huge)).toMatch(/5 MB/);
  });
});

describe("useAutosave timing", () => {
  it("exports 2 second debounce constant", async () => {
    const { AUTOSAVE_DELAY_MS } = await import("@/hooks/use-autosave");
    expect(AUTOSAVE_DELAY_MS).toBe(2000);
  });
});
