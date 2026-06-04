export type PageId = "landing" | "shop" | "login" | "dashboard";

export type NavigateToPage = (page: PageId) => void;
