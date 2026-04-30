# Security Specification - SwasthyaSaathi

## Data Invariants
1. A user can only access their own profile and history records.
2. User ID must be alphanumeric and follow standard UID format.
3. Health metrics must have valid data types and within reasonable bounds.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to update `/users/TARGET_UID` with an authenticated UID of `ATTACKER_UID`.
2. **Path Poisoning**: Inject `../` or long junk strings into `userId` or `recordId`.
3. **Ghost Field Injection**: Add `isAdmin: true` to a user profile update.
4. **Email Spoofing**: Use an unverified email to access admin-only data if it existed.
5. **State Shortcutting**: Manually overriding `burnoutRisk` without updating metrics.
6. **Denial of Wallet**: Sending 10MB of junk string in the `goal` field.
7. **Orphaned Writes**: Creating a history record without a corresponding user profile.
8. **PII Leak**: Attempting to read another user's profile.
9. **Timestamp Manipulation**: Sending a future `date` string.
10. **Schema Violation**: Sending `sleepHours` as a string.
11. **Resource Exhaustion**: Creating 10,000 blank history records in a batch.
12. **System Field Overwrite**: Overwriting internal platform metadata if it existed.

## Test Runner logic
- All writes where `request.auth.uid != userId` must fail.
- All writes with missing required fields in blueprint must fail.
- All writes exceeding field size limits (e.g., goal > 500 chars) must fail.
