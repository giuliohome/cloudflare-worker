addEventListener("fetch", (event) => {
    event.respondWith(
      handleRequest(event.request).catch(
        (err) => new Response(err.stack, { status: 500 })
      )
    );
  });
  
  
  class RemoveElement {
      element(element) {
          if (element.tagName == "script"
              || element.tagName == "header"
          ) {
              element.remove();
          }
          if (element.tagName == "div"
              && element.getAttribute("class") == "news-related"
          ) {
              element.remove();
          }
      }
  }
  
  class RepItElement {
      element(element) {
          if (element.hasAttribute("subscriptions-section") 
              && element.getAttribute("subscriptions-section") == "content"
          ) {
              element.removeAttribute("subscriptions-section");
          }
  
          if (element.hasAttribute("subscriptions-section") 
              && element.getAttribute("subscriptions-section") == "content-not-granted"
          ) {
              element.remove();
          }
          //adv-container
          if (element.hasAttribute("class") 
              && element.getAttribute("class") == "adv-container"
          ) {
              element.remove();
          }
      }
  }
  
  /**
   * Many more examples available at:
   *   https://developers.cloudflare.com/workers/examples
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async function handleRequest(request) {
    const { pathname } = new URL(request.url);
    
    if (pathname.startsWith("/api")) {
      return new Response(JSON.stringify({ pathname }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  
    if (pathname.startsWith("/status")) {
      const httpStatusCode = Number(pathname.split("/")[2]);
  
      return Number.isInteger(httpStatusCode)
        ? fetch("https://http.cat/" + httpStatusCode)
        : new Response("That's not a valid HTTP status code.");
    }
  
    var mycharset = "UTF-8"; 
    if (pathname.indexOf("corriere.it/") > -1) {
        mycharset = "windows-1252";
    }
  const initheaders = {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    }
    const respheaders = {
      headers: {
        "content-type": "text/html;charset="+mycharset
      }
    }
    var ret = await fetch(pathname.replace("/https:/","https://"), respheaders);//split("/")[1]);
    if (pathname.indexOf("repubblica.it/") == -1) {
      const rewriter = new HTMLRewriter()
      .on("*", new RemoveElement());
      return rewriter.transform(ret);
    } else {
      const rewriter = new HTMLRewriter()
      .on("div", new RepItElement());
      return rewriter.transform(ret);  
    }
  
  }