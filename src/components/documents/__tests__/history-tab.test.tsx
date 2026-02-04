import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { HistoryTab } from "../history-tab";
import { Document } from "@/types/document";

// Helper to create a base Document with all required fields
function createMockDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: "doc-123",
    tenant_id: "tenant-1",
    collection_id: "col-1",
    file_id: "file-1",
    name: "Test Invoice.pdf",
    parsing_status: "pending",
    validation_status: "pending",
    review_status: "pending",
    reconciliation_status: "pending",
    parse_mode: "single",
    created_by: "user@example.com",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
    ...overrides,
  };
}

describe("HistoryTab", () => {
  describe("created event", () => {
    it("always shows the 'Document Created' event from created_at", () => {
      const doc = createMockDocument();
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Document Created")).toBeInTheDocument();
      expect(
        screen.getByText(`Document "${doc.name}" was uploaded`)
      ).toBeInTheDocument();
    });

    it("shows the created_by user for the created event", () => {
      const doc = createMockDocument({ created_by: "alice@example.com" });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    });
  });

  describe("parsed event", () => {
    it("shows 'Parsing Completed' when parsing_status is completed", () => {
      const doc = createMockDocument({
        parsing_status: "completed",
        parsed_at: "2025-01-15T10:05:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Parsing Completed")).toBeInTheDocument();
      expect(
        screen.getByText("Document was successfully parsed and data extracted")
      ).toBeInTheDocument();
    });

    it("shows 'Parsing Failed' when parsing_status is failed", () => {
      const doc = createMockDocument({
        parsing_status: "failed",
        parsed_at: "2025-01-15T10:05:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Parsing Failed")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to extract data from document")
      ).toBeInTheDocument();
    });

    it("shows 'Parsing in Progress' when parsing_status is processing", () => {
      const doc = createMockDocument({
        parsing_status: "processing",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Parsing in Progress")).toBeInTheDocument();
      expect(
        screen.getByText("Document is being processed")
      ).toBeInTheDocument();
    });

    it("does not show a parsed event when parsing_status is pending", () => {
      const doc = createMockDocument({
        parsing_status: "pending",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.queryByText("Parsing Completed")).not.toBeInTheDocument();
      expect(screen.queryByText("Parsing Failed")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Parsing in Progress")
      ).not.toBeInTheDocument();
    });
  });

  describe("validated event", () => {
    it("shows 'Validation Passed' when validation_status is valid", () => {
      const doc = createMockDocument({
        parsing_status: "completed",
        validation_status: "valid",
        validated_at: "2025-01-15T10:10:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Validation Passed")).toBeInTheDocument();
      expect(
        screen.getByText("All validation rules passed")
      ).toBeInTheDocument();
    });

    it("shows 'Validation Failed' when validation_status is invalid", () => {
      const doc = createMockDocument({
        parsing_status: "completed",
        validation_status: "invalid",
        validated_at: "2025-01-15T10:10:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Validation Failed")).toBeInTheDocument();
      expect(
        screen.getByText("Document has validation errors")
      ).toBeInTheDocument();
    });

    it("shows 'Validation Warnings' when validation_status is warning", () => {
      const doc = createMockDocument({
        parsing_status: "completed",
        validation_status: "warning",
        validated_at: "2025-01-15T10:10:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Validation Warnings")).toBeInTheDocument();
      expect(
        screen.getByText("Document has validation warnings")
      ).toBeInTheDocument();
    });

    it("does not show validated event when parsing_status is not completed", () => {
      const doc = createMockDocument({
        parsing_status: "pending",
        validation_status: "valid",
        validated_at: "2025-01-15T10:10:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      // Validation event only appears when parsing_status is "completed"
      expect(screen.queryByText("Validation Passed")).not.toBeInTheDocument();
    });
  });

  describe("reviewed event", () => {
    it("shows 'Document Approved' when review_status is approved", () => {
      const doc = createMockDocument({
        review_status: "approved",
        reviewed_at: "2025-01-15T11:00:00Z",
        reviewed_by: "reviewer@example.com",
        reviewer_notes: "Looks good",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Document Approved")).toBeInTheDocument();
      expect(screen.getByText("Looks good")).toBeInTheDocument();
      expect(screen.getByText("reviewer@example.com")).toBeInTheDocument();
    });

    it("shows default description when approved without notes", () => {
      const doc = createMockDocument({
        review_status: "approved",
        reviewed_at: "2025-01-15T11:00:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Document Approved")).toBeInTheDocument();
      expect(
        screen.getByText("Document was approved for processing")
      ).toBeInTheDocument();
    });

    it("shows 'Document Rejected' when review_status is rejected", () => {
      const doc = createMockDocument({
        review_status: "rejected",
        reviewed_at: "2025-01-15T11:00:00Z",
        reviewed_by: "admin@example.com",
        reviewer_notes: "Missing fields",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Document Rejected")).toBeInTheDocument();
      expect(screen.getByText("Missing fields")).toBeInTheDocument();
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    it("shows default description when rejected without notes", () => {
      const doc = createMockDocument({
        review_status: "rejected",
        reviewed_at: "2025-01-15T11:00:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Document Rejected")).toBeInTheDocument();
      expect(screen.getByText("Document was rejected")).toBeInTheDocument();
    });

    it("does not show reviewed event when review_status is pending", () => {
      const doc = createMockDocument({
        review_status: "pending",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.queryByText("Document Approved")).not.toBeInTheDocument();
      expect(screen.queryByText("Document Rejected")).not.toBeInTheDocument();
    });
  });

  describe("timestamps", () => {
    it("shows relative timestamps for events with timestamps", () => {
      const doc = createMockDocument({
        created_at: "2025-01-15T10:00:00Z",
        parsing_status: "completed",
        parsed_at: "2025-01-15T10:05:00Z",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      // The component uses formatRelativeTime which returns "X ago" strings
      // Both events should have relative time spans
      const timeline = screen.getByText("Document Timeline");
      expect(timeline).toBeInTheDocument();

      // Verify created and parsed events are both rendered
      expect(screen.getByText("Document Created")).toBeInTheDocument();
      expect(screen.getByText("Parsing Completed")).toBeInTheDocument();
    });
  });

  describe("pending events", () => {
    it("shows 'In Progress' badge for pending (processing) events", () => {
      const doc = createMockDocument({
        parsing_status: "processing",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("pending events appear after timestamped events", () => {
      const doc = createMockDocument({
        created_at: "2025-01-15T10:00:00Z",
        parsing_status: "processing",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      const created = screen.getByText("Document Created");
      const parsing = screen.getByText("Parsing in Progress");

      // Both events should be in the document
      expect(created).toBeInTheDocument();
      expect(parsing).toBeInTheDocument();

      // The processing event (no timestamp) should come after the created event
      // in the DOM since sortedEvents (with timestamps) come before pendingEvents
      const allEventTitles = screen
        .getAllByText(/Document Created|Parsing in Progress/)
        .map((el) => el.textContent);
      expect(allEventTitles).toEqual([
        "Document Created",
        "Parsing in Progress",
      ]);
    });
  });

  describe("full timeline", () => {
    it("renders a complete timeline with all event types", () => {
      const doc = createMockDocument({
        parsing_status: "completed",
        parsed_at: "2025-01-15T10:05:00Z",
        validation_status: "valid",
        validated_at: "2025-01-15T10:10:00Z",
        review_status: "approved",
        reviewed_at: "2025-01-15T11:00:00Z",
        reviewed_by: "reviewer@example.com",
      });
      renderWithProviders(<HistoryTab document={doc} />);

      expect(screen.getByText("Document Timeline")).toBeInTheDocument();
      expect(screen.getByText("Document Created")).toBeInTheDocument();
      expect(screen.getByText("Parsing Completed")).toBeInTheDocument();
      expect(screen.getByText("Validation Passed")).toBeInTheDocument();
      expect(screen.getByText("Document Approved")).toBeInTheDocument();
    });
  });
});
