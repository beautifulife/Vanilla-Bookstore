const COMPONENT_LIFECYCLE_EVENTS = [
  'BEFORE_RENDER',
  'AFTER_RENDER',
  'BEFORE_DESTROY',
  'AFTER_DESTROY'
];

export default function eventEmitterMixin(target) {
  const eventMap = {};

  COMPONENT_LIFECYCLE_EVENTS.forEach(event => {
    eventMap[event] = [];
  });

  target.on = function (event, cb) {
    if (!eventMap[event]) {
      throw new Error(`Unsupported Event Name "${event}"`);
    }

    eventMap[event].push(cb);
  };

  return function (event) {
    const callbacks = eventMap[event] || [];
    callbacks.forEach(cb => cb());
  };
}
