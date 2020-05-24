1. is-auth middleware adds userId, name and email in req. It gets these details from jwtToken.
2. get-role middleware uses userId from req and gets courseId from query (GET) or body (POST) depending on the method used. It adds role (req.role) and courserId (req.courseId). It can also be used to check whether an user is enrolled in the course or not.
3. is-Instructor checks whether the user is instructor in course or not.
4. is-not-student checks whether the user is instructor or not.