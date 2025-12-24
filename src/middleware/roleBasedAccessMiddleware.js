
const roleBasedAuth = (allowedRole = [], options = {}) => {
    const {allowSelf = false, idParam = 'id'} = options
    return (req, res, next) => {
        if(!req.user) return res.status(401).json({success: false, message: "User not Authenticated"});

        const userRole = req.user.role;
        if(allowedRole.includes(userRole)) {
            return next(); //role allowed
        }
        if(allowSelf) {
            //ownerCheck
            const ownerId = req.params[idParam] || req.query[idParam] || req.body[idParam];
            if(ownerId && String(ownerId) === String(req.user._id || req.user.id)) {
                return next(); //ownerAllowed
            }
        }
        return res.status(403).json({
            success: false, 
            message: "Forbidden Insufficient Permission"
        })
    }
}

export {roleBasedAuth};