import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "../breadcrumbs";

// Override the global next/navigation mock so we can control usePathname per test
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: vi.fn(() => "/"),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe("Breadcrumbs", () => {
  describe("root path", () => {
    it("renders 'Dashboard' label for root path '/'", () => {
      vi.mocked(usePathname).mockReturnValue("/");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("does not render any links for root path", () => {
      vi.mocked(usePathname).mockReturnValue("/");
      renderWithProviders(<Breadcrumbs />);

      // On root path, Dashboard is a span, not a link
      const links = screen.queryAllByRole("link");
      expect(links).toHaveLength(0);
    });
  });

  describe("single segment path", () => {
    it("renders breadcrumbs for '/collections' path", () => {
      vi.mocked(usePathname).mockReturnValue("/collections");
      renderWithProviders(<Breadcrumbs />);

      // Home icon link to "/"
      const homeLink = screen.getByRole("link");
      expect(homeLink).toHaveAttribute("href", "/");

      // "Collections" as the last segment (not a link)
      expect(screen.getByText("Collections")).toBeInTheDocument();
    });

    it("renders last segment as text, not a link", () => {
      vi.mocked(usePathname).mockReturnValue("/collections");
      renderWithProviders(<Breadcrumbs />);

      // Only the Home icon should be a link
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", "/");

      // "Collections" should be a span (non-link)
      const collectionsText = screen.getByText("Collections");
      expect(collectionsText.tagName.toLowerCase()).toBe("span");
    });
  });

  describe("multi-segment path", () => {
    it("renders intermediate segments as links", () => {
      vi.mocked(usePathname).mockReturnValue("/collections/some-id");
      renderWithProviders(<Breadcrumbs />);

      // Home link
      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveAttribute("href", "/");

      // "Collections" should be a link (non-last segment)
      const collectionsLink = screen.getByRole("link", {
        name: "Collections",
      });
      expect(collectionsLink).toHaveAttribute("href", "/collections");
    });

    it("renders last segment as non-link text", () => {
      vi.mocked(usePathname).mockReturnValue("/collections/new");
      renderWithProviders(<Breadcrumbs />);

      // "New" is the last segment, should be a span
      const newText = screen.getByText("New");
      expect(newText.tagName.toLowerCase()).toBe("span");
    });
  });

  describe("UUID segments", () => {
    it("renders 'Details' for UUID segments", () => {
      vi.mocked(usePathname).mockReturnValue(
        "/collections/550e8400-e29b-41d4-a716-446655440000"
      );
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("Details")).toBeInTheDocument();
      // The raw UUID should not be displayed
      expect(
        screen.queryByText("550e8400-e29b-41d4-a716-446655440000")
      ).not.toBeInTheDocument();
    });

    it("renders 'Details' for UUID in the middle of a path as a link", () => {
      vi.mocked(usePathname).mockReturnValue(
        "/collections/550e8400-e29b-41d4-a716-446655440000/settings"
      );
      renderWithProviders(<Breadcrumbs />);

      // UUID segment in the middle should be a link labeled "Details"
      const detailsLink = screen.getByRole("link", { name: "Details" });
      expect(detailsLink).toHaveAttribute(
        "href",
        "/collections/550e8400-e29b-41d4-a716-446655440000"
      );

      // "Settings" should be the last segment (not a link)
      const settingsText = screen.getByText("Settings");
      expect(settingsText.tagName.toLowerCase()).toBe("span");
    });
  });

  describe("known route labels", () => {
    const routes = [
      { path: "/documents", label: "Documents" },
      { path: "/upload", label: "Upload" },
      { path: "/users", label: "Users" },
      { path: "/settings", label: "Settings" },
    ];

    it.each(routes)(
      "renders correct label '$label' for path '$path'",
      ({ path, label }) => {
        vi.mocked(usePathname).mockReturnValue(path);
        renderWithProviders(<Breadcrumbs />);

        expect(screen.getByText(label)).toBeInTheDocument();
      }
    );
  });

  describe("unknown segments", () => {
    it("uses the raw segment text for unknown routes", () => {
      vi.mocked(usePathname).mockReturnValue("/some-custom-page");
      renderWithProviders(<Breadcrumbs />);

      expect(screen.getByText("some-custom-page")).toBeInTheDocument();
    });
  });

  describe("each non-last segment is a link", () => {
    it("all segments except the last are links", () => {
      vi.mocked(usePathname).mockReturnValue("/collections/new");
      renderWithProviders(<Breadcrumbs />);

      // Home link + "Collections" link = 2 links
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);

      // "New" is the last segment and should be text, not a link
      const newText = screen.getByText("New");
      expect(newText.closest("a")).toBeNull();
    });
  });
});
