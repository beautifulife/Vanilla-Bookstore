import domify from 'domify';
import GorillaError from './utils/Error';
import Component from './Component';

export default function View (template, options = {}) {
  const that = this;

  let element = null;
  const childRenderables = {};

  Object.defineProperties(that, {
    // `element` can be modified if `render()` is called again, so this is an accessor, not a data descriptor.
    element: { get: function () { return element; }, enumerable: true }
  });

  that.context = options.context || {};
  that.children = options.children || {};

  that.render = function () {
    const placeholders = {};

    for (let childName in that.children) {
      if (that.children.hasOwnProperty(childName)) {
        if (!(that.children[childName] instanceof Component)) {
          throw new GorillaError(`Child "${childName}" must be a gorilla component instance`);
        }

        childRenderables[childName] = that.children[childName].render();
        placeholders[childName] = `<div data-gorilla-target="${childName}"></div>`;
      }
    }

    const templateData = Object.assign({}, that.context, placeholders);
    const oldElement = element;

    element = domify(template(templateData));

    if (element instanceof DocumentFragment) {
      throw new GorillaError('Gorilla component must be wrapped in a single element');
    }

    for (let childName in placeholders) {
      if (placeholders.hasOwnProperty(childName)) {
        const target = element.querySelector(`div[data-gorilla-target="${childName}"]`);
        childRenderables[childName].dataset.gorillaComponent = childName;
        target.parentNode.replaceChild(childRenderables[childName], target);
      }
    }

    if (oldElement && oldElement.parentNode) {
      oldElement.parentNode.replaceChild(element, oldElement);
    }

    return element;
  };

  that.destroy = function () {
    if (!element || !element.parentNode) {
      throw new GorillaError("View elements must be in the DOM to be destroyed.");
    }

    element.parentNode.removeChild(element);

    element = null;
  };
}
