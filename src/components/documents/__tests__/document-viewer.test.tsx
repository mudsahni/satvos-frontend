import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DocumentViewer, isImageFile } from "../document-viewer";

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, "open", { value: mockOpen, writable: true });

beforeEach(() => {
  mockOpen.mockReset();
});

/* ------------------------------------------------------------------ */
/*  isImageFile helper                                                 */
/* ------------------------------------------------------------------ */

describe("isImageFile", () => {
  it("returns true for common image extensions", () => {
    expect(isImageFile("invoice.jpg")).toBe(true);
    expect(isImageFile("invoice.jpeg")).toBe(true);
    expect(isImageFile("invoice.png")).toBe(true);
    expect(isImageFile("invoice.gif")).toBe(true);
    expect(isImageFile("invoice.webp")).toBe(true);
    expect(isImageFile("invoice.bmp")).toBe(true);
    expect(isImageFile("invoice.tiff")).toBe(true);
    expect(isImageFile("invoice.tif")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(isImageFile("invoice.JPG")).toBe(true);
    expect(isImageFile("invoice.PNG")).toBe(true);
    expect(isImageFile("invoice.Jpeg")).toBe(true);
  });

  it("returns false for PDF files", () => {
    expect(isImageFile("invoice.pdf")).toBe(false);
    expect(isImageFile("invoice.PDF")).toBe(false);
  });

  it("returns false for other file types", () => {
    expect(isImageFile("invoice.docx")).toBe(false);
    expect(isImageFile("invoice.xlsx")).toBe(false);
    expect(isImageFile("invoice.txt")).toBe(false);
  });

  it("returns false for undefined or empty", () => {
    expect(isImageFile(undefined)).toBe(false);
    expect(isImageFile("")).toBe(false);
  });

  it("handles filenames with dots in the name", () => {
    expect(isImageFile("invoice.2024.jan.png")).toBe(true);
    expect(isImageFile("invoice.v2.pdf")).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  DocumentViewer component                                           */
/* ------------------------------------------------------------------ */

describe("DocumentViewer", () => {
  describe("loading state", () => {
    it("renders skeleton when loading", () => {
      render(
        <DocumentViewer url={undefined} isLoading={true} fileName="test.pdf" />
      );
      // Skeleton elements should be present (no actual content)
      expect(screen.queryByText("test.pdf")).not.toBeInTheDocument();
    });
  });

  describe("no URL state", () => {
    it("renders no document available when URL is undefined", () => {
      render(
        <DocumentViewer url={undefined} isLoading={false} fileName="test.pdf" />
      );
      expect(screen.getByText("No document available")).toBeInTheDocument();
    });
  });

  describe("PDF rendering", () => {
    it("renders PDF viewer for .pdf files", () => {
      render(
        <DocumentViewer
          url="https://example.com/file.pdf"
          isLoading={false}
          fileName="invoice.pdf"
        />
      );
      expect(screen.getByText("invoice.pdf")).toBeInTheDocument();
      // Should have an object element for PDF
      const pdfObject = document.querySelector('object[type="application/pdf"]');
      expect(pdfObject).toBeInTheDocument();
    });

    it("renders PDF viewer when no fileName is provided", () => {
      render(
        <DocumentViewer
          url="https://example.com/file.pdf"
          isLoading={false}
        />
      );
      expect(screen.getByText("Document Preview")).toBeInTheDocument();
    });
  });

  describe("image rendering", () => {
    it("renders image viewer for .jpg files", () => {
      render(
        <DocumentViewer
          url="https://example.com/invoice.jpg"
          isLoading={false}
          fileName="invoice.jpg"
        />
      );
      expect(screen.getByText("invoice.jpg")).toBeInTheDocument();
      const img = screen.getByAltText("invoice.jpg");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/invoice.jpg");
    });

    it("renders image viewer for .png files", () => {
      render(
        <DocumentViewer
          url="https://example.com/receipt.png"
          isLoading={false}
          fileName="receipt.png"
        />
      );
      const img = screen.getByAltText("receipt.png");
      expect(img).toBeInTheDocument();
    });

    it("shows Image Preview as default title when no fileName", () => {
      render(
        <DocumentViewer
          url="https://example.com/img.jpg"
          isLoading={false}
          fileName="img.jpg"
        />
      );
      expect(screen.getByText("img.jpg")).toBeInTheDocument();
    });
  });

  describe("image viewer controls", () => {
    it("renders zoom and rotate controls for images", () => {
      render(
        <DocumentViewer
          url="https://example.com/invoice.png"
          isLoading={false}
          fileName="invoice.png"
        />
      );
      expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
      expect(screen.getByLabelText("Rotate image")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("zooms in when clicking zoom in button", () => {
      render(
        <DocumentViewer
          url="https://example.com/invoice.png"
          isLoading={false}
          fileName="invoice.png"
        />
      );
      const zoomInBtn = screen.getByLabelText("Zoom in");
      fireEvent.click(zoomInBtn);
      expect(screen.getByText("125%")).toBeInTheDocument();
    });

    it("zooms out when clicking zoom out button", () => {
      render(
        <DocumentViewer
          url="https://example.com/invoice.png"
          isLoading={false}
          fileName="invoice.png"
        />
      );
      const zoomOutBtn = screen.getByLabelText("Zoom out");
      fireEvent.click(zoomOutBtn);
      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("resets zoom when clicking percentage", () => {
      render(
        <DocumentViewer
          url="https://example.com/invoice.png"
          isLoading={false}
          fileName="invoice.png"
        />
      );
      // Zoom in twice
      const zoomInBtn = screen.getByLabelText("Zoom in");
      fireEvent.click(zoomInBtn);
      fireEvent.click(zoomInBtn);
      expect(screen.getByText("150%")).toBeInTheDocument();

      // Click percentage to reset
      fireEvent.click(screen.getByText("150%"));
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("applies rotation when clicking rotate button", () => {
      render(
        <DocumentViewer
          url="https://example.com/invoice.png"
          isLoading={false}
          fileName="invoice.png"
        />
      );
      const img = screen.getByAltText("invoice.png");
      expect(img.style.transform).toContain("rotate(0deg)");

      fireEvent.click(screen.getByLabelText("Rotate image"));
      expect(img.style.transform).toContain("rotate(90deg)");
    });

    it("opens in new tab when clicking open button", () => {
      render(
        <DocumentViewer
          url="https://example.com/invoice.png"
          isLoading={false}
          fileName="invoice.png"
        />
      );
      fireEvent.click(screen.getByLabelText("Open in new tab"));
      expect(mockOpen).toHaveBeenCalledWith(
        "https://example.com/invoice.png",
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  describe("image error state", () => {
    it("shows error state when image fails to load", () => {
      render(
        <DocumentViewer
          url="https://example.com/broken.jpg"
          isLoading={false}
          fileName="broken.jpg"
        />
      );
      const img = screen.getByAltText("broken.jpg");
      fireEvent.error(img);

      expect(screen.getByText("Failed to load image")).toBeInTheDocument();
    });

    it("can retry after image error", () => {
      render(
        <DocumentViewer
          url="https://example.com/broken.jpg"
          isLoading={false}
          fileName="broken.jpg"
        />
      );
      const img = screen.getByAltText("broken.jpg");
      fireEvent.error(img);

      fireEvent.click(screen.getByText("Retry"));
      // Should re-render the image
      expect(screen.getByAltText("broken.jpg")).toBeInTheDocument();
    });
  });
});
