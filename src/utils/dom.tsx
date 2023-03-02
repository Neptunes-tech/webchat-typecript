export function onRemove(element:any, callback:any) {
    const obs = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((el) => {
          if (el.contains(element)) {
            obs.disconnect();
            callback();
          }
        });
      });
    });
    obs.observe(document, {
      childList: true,
      subtree: true
    });
  }
  
  
  export function safeQuerySelectorAll(selector:any) {
    let elements
    try {
      elements = document.querySelectorAll(selector);
    } catch (e) {
      elements = []
    }
    return elements
  }