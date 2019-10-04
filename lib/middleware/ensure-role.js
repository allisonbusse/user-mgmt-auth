
module.exports = function createEnsureRole(role) {
  return ({ user }, res, next) => {

    if(!(user && user.roles && user.roles.includes(role))) {
      next({
        statusCode: 403,
        error: `User not authorized, must be "${role}"`
      });
    }
    else {
      next();
    }
  };
};