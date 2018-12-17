function GorillaError (message) {
  Error.call(this);
  this.message = message;
}

GorillaError.prototype = Object.create(Error);
GorillaError.prototype.constructor = GorillaError;

export default GorillaError;
