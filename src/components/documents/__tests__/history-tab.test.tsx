import { vi, type Mock } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/test-utils";
import { HistoryTab } from "../history-tab";
import { AuditEntry, AuditResponse } from "@/types/audit";

// Mock the audit API
vi.mock("@/lib/api/audit", () => ({
  getDocumentAudit: vi.fn(),
}));

// Mock UserName so it renders the raw ID without making API calls
vi.mock("@/components/ui/user-name", () => ({
  UserName: ({ id }: { id: string }) => <>{id}</>,
}));

import { getDocumentAudit } from "@/lib/api/audit";

const mockGetDocumentAudit = getDocumentAudit as Mock;

function createAuditEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id: "audit-1",
    tenant_id: "tenant-1",
    document_id: "doc-123",
    user_id: "user-1",
    action: "document.created",
    changes: {},
    created_at: "2025-01-15T10:00:00Z",
    ...overrides,
  };
}

function createAuditResponse(
  entries: AuditEntry[],
  meta?: Partial<AuditResponse["meta"]>
): AuditResponse {
  return {
    success: true,
    data: entries,
    meta: {
      page: 1,
      page_size: 50,
      total: entries.length,
      ...meta,
    },
  };
}

describe("HistoryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows skeleton while loading", () => {
      mockGetDocumentAudit.mockReturnValue(new Promise(() => {}));
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      expect(screen.getByText("Document Timeline")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error message with retry button on failure", async () => {
      mockGetDocumentAudit.mockRejectedValue(new Error("Network error"));
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to load history")
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty state when no audit entries", async () => {
      mockGetDocumentAudit.mockResolvedValue(createAuditResponse([]));
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("No activity yet")).toBeInTheDocument();
      });
    });
  });

  describe("document.created", () => {
    it("shows Document Created with document type", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.created",
            changes: { document_type: "invoice" },
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Document Created")).toBeInTheDocument();
      });
      expect(screen.getByText("Uploaded as invoice")).toBeInTheDocument();
    });

    it("shows fallback description when no document_type", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({ action: "document.created", changes: {} }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Document uploaded")).toBeInTheDocument();
      });
    });
  });

  describe("document.parse_completed", () => {
    it("shows Parsing Completed with parser model", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.parse_completed",
            changes: { parser_model: "gpt-4o" },
            user_id: null,
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Parsing Completed")).toBeInTheDocument();
      });
      expect(screen.getByText("Parsed with gpt-4o")).toBeInTheDocument();
    });
  });

  describe("document.parse_failed", () => {
    it("shows Parsing Failed with error message", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.parse_failed",
            changes: { error: "Timeout during extraction" },
            user_id: null,
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Parsing Failed")).toBeInTheDocument();
      });
      expect(
        screen.getByText("Timeout during extraction")
      ).toBeInTheDocument();
    });
  });

  describe("document.parse_queued", () => {
    it("shows Parsing Queued with attempt number", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.parse_queued",
            changes: { attempt: 2 },
            user_id: null,
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Parsing Queued")).toBeInTheDocument();
      });
    });
  });

  describe("document.review", () => {
    it("shows Document Approved with notes", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.review",
            changes: { status: "approved", notes: "Looks good" },
            user_id: "reviewer-1",
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Document Approved")).toBeInTheDocument();
      });
      expect(screen.getByText("Looks good")).toBeInTheDocument();
      expect(screen.getByText("reviewer-1")).toBeInTheDocument();
    });

    it("shows Document Rejected", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.review",
            changes: { status: "rejected", notes: "Missing fields" },
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Document Rejected")).toBeInTheDocument();
      });
      expect(screen.getByText("Missing fields")).toBeInTheDocument();
    });
  });

  describe("document.validate", () => {
    it("shows Validation Triggered", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.validate",
            changes: {},
            user_id: null,
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Validation Triggered")).toBeInTheDocument();
      });
    });
  });

  describe("document.validation_completed", () => {
    it("shows Validation Passed when status is valid", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.validation_completed",
            changes: { status: "valid" },
            user_id: null,
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Validation Passed")).toBeInTheDocument();
      });
      expect(
        screen.getByText("All validation rules passed")
      ).toBeInTheDocument();
    });

    it("shows Validation Failed when status is invalid", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.validation_completed",
            changes: { status: "invalid" },
            user_id: null,
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Validation Failed")).toBeInTheDocument();
      });
    });

    it("shows Validation Warnings when status is warning", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.validation_completed",
            changes: { status: "warning" },
            user_id: null,
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Validation Warnings")).toBeInTheDocument();
      });
    });
  });

  describe("document.edit_structured_data", () => {
    it("shows Data Edited", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.edit_structured_data",
            user_id: "editor-1",
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Data Edited")).toBeInTheDocument();
      });
      expect(
        screen.getByText("Invoice data manually edited")
      ).toBeInTheDocument();
    });
  });

  describe("document.tags_added", () => {
    it("shows Tags Added with key:value pairs", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            action: "document.tags_added",
            changes: { tags: { vendor: "Acme" } },
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Tags Added")).toBeInTheDocument();
      });
      expect(screen.getByText("vendor: Acme")).toBeInTheDocument();
    });
  });

  describe("document.deleted", () => {
    it("shows Document Deleted", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({ action: "document.deleted", user_id: null }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Document Deleted")).toBeInTheDocument();
      });
    });
  });

  describe("user display", () => {
    it("shows 'System' in italic for null user_id", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([createAuditEntry({ user_id: null })])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("System")).toBeInTheDocument();
      });
    });

    it("shows UserName for non-null user_id", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([createAuditEntry({ user_id: "user-42" })])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("user-42")).toBeInTheDocument();
      });
    });
  });

  describe("pagination", () => {
    it("shows 'Load more' button when there are more entries", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([createAuditEntry()], { total: 100 })
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /load more/i })
        ).toBeInTheDocument();
      });
    });

    it("does not show 'Load more' when all entries are loaded", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([createAuditEntry()], { total: 1 })
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Document Created")).toBeInTheDocument();
      });
      expect(
        screen.queryByRole("button", { name: /load more/i })
      ).not.toBeInTheDocument();
    });

    it("fetches next page when 'Load more' is clicked", async () => {
      mockGetDocumentAudit
        .mockResolvedValueOnce(
          createAuditResponse(
            [createAuditEntry({ id: "audit-1" })],
            { page: 1, total: 2 }
          )
        )
        .mockResolvedValueOnce(
          createAuditResponse(
            [
              createAuditEntry({
                id: "audit-2",
                action: "document.validate",
                changes: { status: "valid" },
              }),
            ],
            { page: 2, total: 2 }
          )
        );

      const user = userEvent.setup();
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /load more/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /load more/i }));

      await waitFor(() => {
        expect(mockGetDocumentAudit).toHaveBeenCalledWith("doc-123", {
          page: 2,
          page_size: 50,
        });
      });
    });
  });

  describe("full timeline", () => {
    it("renders multiple events in order", async () => {
      mockGetDocumentAudit.mockResolvedValue(
        createAuditResponse([
          createAuditEntry({
            id: "a1",
            action: "document.created",
            created_at: "2025-01-15T10:00:00Z",
          }),
          createAuditEntry({
            id: "a2",
            action: "document.parse_completed",
            created_at: "2025-01-15T10:05:00Z",
            user_id: null,
          }),
          createAuditEntry({
            id: "a3",
            action: "document.validation_completed",
            changes: { status: "valid" },
            created_at: "2025-01-15T10:06:00Z",
            user_id: null,
          }),
          createAuditEntry({
            id: "a4",
            action: "document.review",
            changes: { status: "approved" },
            created_at: "2025-01-15T11:00:00Z",
          }),
        ])
      );
      renderWithProviders(<HistoryTab documentId="doc-123" />);

      await waitFor(() => {
        expect(screen.getByText("Document Created")).toBeInTheDocument();
      });
      expect(screen.getByText("Parsing Completed")).toBeInTheDocument();
      expect(screen.getByText("Validation Passed")).toBeInTheDocument();
      expect(screen.getByText("Document Approved")).toBeInTheDocument();
    });
  });
});
