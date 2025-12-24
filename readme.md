-> Actions that I want to log 
# user
1. new user created/registered
2. user loggedIn
<!-- 3. user open his profile -->
4. user update profile 
<!-- Activity log and Audit Trail(what fields changed) -->
5. user change password - 
<!-- never log password itself only log that this event happened -->
<!-- Activity log and Audit Trail(just record that it happened) -->
6. login failure
<!-- Log type: Activity Log Even if user doesn’t exist -->

# upload
1. user uploaded file
<!-- Log IF: 
File is important (documents, product images, certificates)
File affects business logic

Do NOT log IF:
Temporary uploads
Preview-only uploads

Log type:
Activity Log  (if important) -->

2. admin uploaded file
<!-- Activity log -->

# Category
1. admin create Category - Activity Log ✅
<!-- 2. admin gets Category -->
3. admin update Category
<!-- Log type:
Activity Log
Audit Trail (name changed, status changed) -->
4. admin delete Category 
<!-- Activity Log 
Audit Trail  -->

# subCategory
1. admin create subCategory
<!-- 2. admin gets subCategory -->
3. admin update SubCategory
4. admin delete subCategory

# Order - Activity Log and Audit Trail
1. user placeOrder
<!-- 2. user check myOrders -->
<!-- 3. user checks singleOrder -->
<!-- 4. admin fetching all users order, search them based on username or email, sort them in latest/oldest -->
5. admin update OrderStatus 
6. user cancel order if Orderstatus is pending

# Product
1. user creates Product- log
<!-- 2. user gets all myProducts -->
3. user updates Product - log+trial
4. user delete Product - log+trial

# Notifications
<!-- 1. user gets all notifications -->
<!-- 2. user gets all unread notifications and unread notifications count -->
<!-- 3. user mark notifications as read -->
<!-- 4. user deletes notifications -->
5. System - notification creation when orderPlaced, orderCancelled, orderstatus update and so on. - log