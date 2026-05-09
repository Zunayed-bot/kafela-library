export type Role = "ADMIN" | "USER";
export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
export type BorrowStatus = "ACTIVE" | "RETURNED" | "OVERDUE";
export type ReservationStatus = "PENDING" | "FULFILLED" | "CANCELLED" | "EXPIRED";
export type BookStatus = "AVAILABLE" | "ALL_ISSUED" | "RESERVED" | "UNAVAILABLE";
export type MembershipTier = "SILVER" | "GOLDEN" | "PLATINUM";

export interface User {
  id: string;
  name: string;
  studentId: string;
  phone: string;
  email?: string;
  department?: string;
  session?: string;
  profilePicture?: string;
  role: Role;
  status: AccountStatus;
  membershipTier: MembershipTier;
  borrowLimit: number;
  isActivated: boolean;
  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  title: string;
  titleBangla?: string;
  author: string;
  authorBangla?: string;
  publisher?: string;
  publishedYear?: number;
  isbn?: string;
  category: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  shelfNumber?: string;
  price?: number;
  language: string;
  tags: string[];
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Borrowing {
  id: string;
  userId: string;
  bookId: string;
  issuedDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  status: BorrowStatus;
  renewCount: number;
  notes?: string;
  createdAt: Date;
  user?: User;
  book?: Book;
}

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  status: ReservationStatus;
  queuePosition: number;
  requestedAt: Date;
  expiresAt?: Date;
  user?: User;
  book?: Book;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  adminId?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
  user?: User;
  admin?: User;
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeUsers: number;
  issuedBooks: number;
  returnedToday: number;
  overdueBooks: number;
  availableBooks: number;
  reservations: number;
}
