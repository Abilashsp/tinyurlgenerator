# TinyLink - Complete Testing Guide

## 🧪 Manual Testing Guide

This guide provides comprehensive test cases for all API endpoints and frontend functionality.

## Prerequisites

- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- MongoDB running and connected
- `curl` installed or Postman/Insomnia

## 🔍 API Testing

### 1. Health Check Endpoint

**Test:** Verify server is running

```bash
curl http://localhost:5000/healthz
```

**Expected Response:**
```json
{
  "ok": true,
  "version": "1.0"
}
```

**Expected Status:** 200 OK

---

### 2. Create Link - Auto-Generated Code

**Test:** Create a shortened link with auto-generated code

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://github.com/torvalds/linux"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "code": "aBcDeF",
    "longUrl": "https://github.com/torvalds/linux",
    "clicks": 0,
    "lastClicked": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expected Status:** 201 Created

**Validation:**
- [ ] Code is 6-8 characters
- [ ] Code is alphanumeric
- [ ] Code is lowercase
- [ ] Clicks is 0
- [ ] lastClicked is null
- [ ] createdAt is timestamp

---

### 3. Create Link - Custom Code

**Test:** Create a shortened link with custom code

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://www.example.com",
    "code": "mycode"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "code": "mycode",
    "longUrl": "https://www.example.com",
    "clicks": 0,
    "lastClicked": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expected Status:** 201 Created

**Validation:**
- [ ] Code matches what was provided
- [ ] Code is lowercase (case-insensitive)
- [ ] Response is successful

---

### 4. Create Link - Invalid URL

**Test:** Try to create link with invalid URL

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "not a valid url"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid URL format",
  "statusCode": 400
}
```

**Expected Status:** 400 Bad Request

**Validation:**
- [ ] Error message is clear
- [ ] Status code is 400
- [ ] No link created in database

---

### 5. Create Link - Missing Required Field

**Test:** Try to create link without longUrl

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "longUrl is required",
  "statusCode": 400
}
```

**Expected Status:** 400 Bad Request

---

### 6. Create Link - Invalid Custom Code Format

**Test:** Try custom code that's too short

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://example.com",
    "code": "ab"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Short code must be 6-8 alphanumeric characters",
  "statusCode": 400
}
```

**Expected Status:** 400 Bad Request

---

### 7. Create Link - Invalid Custom Code (Special Characters)

**Test:** Try custom code with special characters

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://example.com",
    "code": "test-123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Short code must be 6-8 alphanumeric characters",
  "statusCode": 400
}
```

**Expected Status:** 400 Bad Request

---

### 8. Create Link - Duplicate Code (409 Conflict)

**Prerequisites:** Must have already created a link with code "mycode" (from test #3)

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://different-url.com",
    "code": "mycode"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Short code already in use",
  "statusCode": 409
}
```

**Expected Status:** 409 Conflict

**Validation:**
- [ ] Error message indicates code already exists
- [ ] Status code is 409 (not 400)
- [ ] No new link created

---

### 9. Get All Links

**Test:** Retrieve list of all created links

```bash
curl http://localhost:5000/api/links
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "mycode",
      "longUrl": "https://www.example.com",
      "clicks": 5,
      "lastClicked": "2024-01-15T10:35:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "code": "aBcDeF",
      "longUrl": "https://github.com/torvalds/linux",
      "clicks": 0,
      "lastClicked": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Expected Status:** 200 OK

**Validation:**
- [ ] Array of links returned
- [ ] Links sorted by date (newest first if descending)
- [ ] Each link has all required fields
- [ ] Clicks reflect actual redirects

---

### 10. Get Link Stats - Success

**Test:** Get statistics for existing link

```bash
curl http://localhost:5000/api/links/mycode
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "code": "mycode",
    "longUrl": "https://www.example.com",
    "clicks": 5,
    "lastClicked": "2024-01-15T10:35:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expected Status:** 200 OK

---

### 11. Get Link Stats - Not Found

**Test:** Get stats for non-existent link

```bash
curl http://localhost:5000/api/links/nonexistent
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Link not found",
  "statusCode": 404
}
```

**Expected Status:** 404 Not Found

---

### 12. Redirect - Success

**Test:** Redirect to original URL and increment clicks

```bash
# Before redirect
curl http://localhost:5000/api/links/mycode
# Note clicks count

# Do the redirect
curl -L http://localhost:5000/mycode

# After redirect
curl http://localhost:5000/api/links/mycode
# Verify clicks increased by 1
```

**Expected Behavior:**
1. First request returns link stats with `clicks: 5`
2. Redirect request returns 302 Found with Location header
3. `-L` flag follows redirect to original URL
4. Second request shows `clicks: 6`
5. `lastClicked` is updated to recent timestamp

**Expected Status:** 302 Found (temporary redirect)

**Validation:**
- [ ] Click count increments
- [ ] lastClicked timestamp is updated
- [ ] Redirect goes to correct original URL

---

### 13. Redirect - Not Found

**Test:** Try to redirect to non-existent code

```bash
curl -L http://localhost:5000/nonexistent
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Link not found",
  "statusCode": 404
}
```

**Expected Status:** 404 Not Found

**Validation:**
- [ ] No redirect happens
- [ ] Error response returned

---

### 14. Delete Link - Success

**Test:** Delete an existing link

```bash
# Before delete
curl http://localhost:5000/api/links

# Delete the link
curl -X DELETE http://localhost:5000/api/links/mycode

# After delete
curl http://localhost:5000/api/links
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Link deleted successfully"
}
```

**Expected Status:** 200 OK

**Validation:**
- [ ] Success response returned
- [ ] Link no longer in list
- [ ] Click count list is shorter by 1

---

### 15. Delete Link - Not Found

**Test:** Try to delete non-existent link

```bash
curl -X DELETE http://localhost:5000/api/links/nonexistent
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Link not found",
  "statusCode": 404
}
```

**Expected Status:** 404 Not Found

---

### 16. Delete Link - Then Redirect (404)

**Test:** Redirect to deleted link should return 404

```bash
# Create link
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://example.com","code":"templink"}'

# Verify redirect works
curl -L http://localhost:5000/templink

# Delete link
curl -X DELETE http://localhost:5000/api/links/templink

# Try redirect again - should 404
curl http://localhost:5000/templink
```

**Expected Response (final):**
```json
{
  "success": false,
  "error": "Link not found",
  "statusCode": 404
}
```

**Expected Status:** 404 Not Found

**Validation:**
- [ ] Redirect worked before deletion
- [ ] After deletion, redirect returns 404
- [ ] Link is truly gone from database

---

## 🎨 Frontend Testing

### 1. Dashboard Page Load

**Test:** Verify dashboard loads with all components

**Steps:**
1. Open `http://localhost:5173`

**Verify:**
- [ ] Header displays with TinyLink logo
- [ ] "Dashboard" title visible
- [ ] Link creation form displays
- [ ] Form has "Long URL" input field
- [ ] Form has "Custom Code" input field
- [ ] "Create Link" button visible
- [ ] No console errors in DevTools

---

### 2. Empty State

**Test:** Verify empty state when no links exist

**Steps:**
1. If links exist, delete them all via API or DB
2. Reload page
3. Look below form

**Verify:**
- [ ] Message "No links yet. Create one to get started!"
- [ ] No table displayed

---

### 3. Create Link - Form Validation

**Test:** Verify form validation works

**Steps:**
1. Click "Create Link" without filling URL
2. Should show error "URL is required"

**Verify:**
- [ ] Error message appears in red box
- [ ] Form doesn't submit
- [ ] Page doesn't navigate

---

### 4. Create Link - Custom Code Validation

**Test:** Verify custom code format validation

**Steps:**
1. Enter long URL: `https://example.com`
2. Enter custom code: `ab` (too short)
3. Click "Create Link"
4. Should show error about code format

**Verify:**
- [ ] Error message: "Custom code must be 6-8 alphanumeric characters"
- [ ] Form doesn't submit

---

### 5. Create Link - Success

**Test:** Create link with auto-generated code

**Steps:**
1. Clear any errors
2. Enter URL: `https://www.github.com`
3. Leave custom code empty
4. Click "Create Link"
5. Wait for loading to finish

**Verify:**
- [ ] Button shows "Creating..." while loading
- [ ] Success message appears: "Link created successfully!"
- [ ] Success message disappears after 3 seconds
- [ ] Form clears
- [ ] New link appears in table

---

### 6. Link Table Display

**Test:** Verify link table shows correct information

**Verify for each link in table:**
- [ ] Short code displayed (monospace, blue, 6-8 chars)
- [ ] Long URL displayed and clickable
- [ ] Click count in blue badge
- [ ] Creation date formatted correctly
- [ ] "Stats" button blue and clickable
- [ ] "Copy" button gray and clickable
- [ ] "Delete" button red and clickable

---

### 7. Copy URL Button

**Test:** Verify copy-to-clipboard functionality

**Steps:**
1. In link table, click "Copy" button
2. Alert should say "Copied to clipboard!"
3. Paste (Ctrl+V) in text editor

**Verify:**
- [ ] Alert appears
- [ ] Copied text is short URL: `http://localhost:5173/{code}`
- [ ] URL is correct

---

### 8. Navigate to Stats Page

**Test:** Navigate to stats page via button

**Steps:**
1. In link table, click "Stats" button for any link
2. URL should change to `/stats/{code}`
3. Wait for page to load

**Verify:**
- [ ] Header still visible
- [ ] Back button visible
- [ ] Statistics page displays
- [ ] Click count showing correct number
- [ ] No page errors

---

### 9. Stats Page Display

**Test:** Verify stats page shows all information

**Verify:**
- [ ] Short URL displayed with copy button
- [ ] Click count displayed in green badge
- [ ] Original URL displayed and clickable
- [ ] Created date shown
- [ ] Last clicked date shown (or "Never" if no clicks)
- [ ] "Visit Original URL" button visible
- [ ] "Back to Dashboard" button visible

---

### 10. Stats Page Auto-Refresh

**Test:** Verify click count updates automatically

**Steps:**
1. Note click count on stats page
2. In another tab, visit the short URL
3. Wait 5 seconds
4. Return to stats page
5. Click count should increase

**Verify:**
- [ ] Click count increases
- [ ] lastClicked timestamp updates
- [ ] No manual refresh needed

---

### 11. Delete Link - Confirmation

**Test:** Verify delete confirmation dialog

**Steps:**
1. In dashboard table, click "Delete" button
2. Browser confirmation dialog appears
3. Click "Cancel"

**Verify:**
- [ ] Dialog appears with confirmation message
- [ ] Link is NOT deleted when clicking Cancel
- [ ] Still in dashboard

---

### 12. Delete Link - Success

**Test:** Delete link from dashboard

**Steps:**
1. Note number of links displayed
2. Click "Delete" button on any link
3. Confirm deletion in dialog
4. Wait for deletion to complete

**Verify:**
- [ ] "Delete" button shows "Deleting..." while loading
- [ ] Link disappears from table
- [ ] Link count decreases by 1
- [ ] No errors displayed

---

### 13. Deleted Link - 404 on Stats

**Test:** Try to access stats for deleted link

**Steps:**
1. Delete a link
2. Go to `/stats/{deleted-code}` directly in URL
3. Wait for page to load

**Verify:**
- [ ] Error message displays: "Link not found"
- [ ] Page doesn't crash
- [ ] "Back to Dashboard" button still works

---

### 14. Responsive Design - Mobile

**Test:** Verify mobile responsiveness

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Set viewport to iPhone 12 (390x844)
4. Reload page

**Verify:**
- [ ] Layout stacks vertically
- [ ] Form inputs full width
- [ ] Table scrolls horizontally
- [ ] Buttons remain clickable
- [ ] No horizontal scroll on main page
- [ ] Header responsive

---

### 15. Responsive Design - Tablet

**Test:** Verify tablet responsiveness

**Steps:**
1. Set viewport to iPad (768x1024)
2. Reload page

**Verify:**
- [ ] Content centered
- [ ] Two-column layout for stats (if applied)
- [ ] All elements accessible
- [ ] Text readable

---

### 16. Error Handling - API Down

**Test:** Verify error handling when API is unavailable

**Steps:**
1. Stop backend server (Ctrl+C in backend terminal)
2. Try to create link in frontend
3. Wait 10+ seconds

**Verify:**
- [ ] Error message displays
- [ ] Form doesn't break
- [ ] Can restart backend and try again

---

### 17. Form Error Recovery

**Test:** Verify form recovers from API errors

**Steps:**
1. Enter valid URL: `https://example.com`
2. Try custom code: `badcode123` (too long)
3. Error displays
4. Fix code: `good123`
5. Submit again

**Verify:**
- [ ] Form accepts correction
- [ ] Link creates successfully
- [ ] No lingering errors

---

### 18. Navigation

**Test:** Verify routing works correctly

**Steps:**
1. Dashboard → Create link → Click Stats → Back to Dashboard
2. Dashboard → Type `/stats/abc123` directly → Click Back
3. Dashboard → Refresh page → Still on dashboard

**Verify:**
- [ ] All navigation works
- [ ] Page state preserved on refresh
- [ ] No broken links
- [ ] Back button works from stats

---

## 📊 Test Execution Checklist

### API Tests
- [ ] Test 1: Health check
- [ ] Test 2: Create auto-code
- [ ] Test 3: Create custom code
- [ ] Test 4: Invalid URL
- [ ] Test 5: Missing required field
- [ ] Test 6: Invalid code (too short)
- [ ] Test 7: Invalid code (special chars)
- [ ] Test 8: Duplicate code (409)
- [ ] Test 9: Get all links
- [ ] Test 10: Get link stats
- [ ] Test 11: Link not found
- [ ] Test 12: Redirect (success + click increment)
- [ ] Test 13: Redirect (not found)
- [ ] Test 14: Delete (success)
- [ ] Test 15: Delete (not found)
- [ ] Test 16: Delete then redirect (404)

### Frontend Tests
- [ ] Test 1: Dashboard page load
- [ ] Test 2: Empty state
- [ ] Test 3: Form validation
- [ ] Test 4: Custom code validation
- [ ] Test 5: Create link success
- [ ] Test 6: Table display
- [ ] Test 7: Copy button
- [ ] Test 8: Navigate to stats
- [ ] Test 9: Stats page display
- [ ] Test 10: Auto-refresh click count
- [ ] Test 11: Delete confirmation
- [ ] Test 12: Delete success
- [ ] Test 13: Deleted link 404
- [ ] Test 14: Mobile responsive
- [ ] Test 15: Tablet responsive
- [ ] Test 16: API error handling
- [ ] Test 17: Form error recovery
- [ ] Test 18: Navigation

## 🎯 Summary

✅ **Total Tests:** 34 comprehensive test cases
✅ **API Coverage:** All 6 endpoints + error cases
✅ **Frontend Coverage:** UX, validation, responsiveness, error handling

After passing all tests, your TinyLink application is production-ready!

---

**Last Updated:** January 2024
