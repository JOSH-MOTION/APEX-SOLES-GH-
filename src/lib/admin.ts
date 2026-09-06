// Client-side UI gating only (e.g. "Sold by Apex Soles" badges, showing admin-only
// buttons). This is NOT a security boundary — a user can always tamper with client
// JS. The real trust boundary is Firestore security rules (see firestore.rules in
// the repo root), which must reference these same UIDs. Fill in your real admin
// Firebase Auth UID(s) below — find it in Firebase Console → Authentication → Users
// after signing in once through /admin.
export const ADMIN_UIDS: string[] = [
  "oK9ql3eVJoaMShN2BeeMqjfCXj23",
];

export function isAdminUid(uid: string | null | undefined): boolean {
  if (!uid) return false;
  return ADMIN_UIDS.includes(uid);
}
