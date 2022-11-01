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

class CookieDeleter {
  element(element) {
			element.onEndTag((tag) => {
					// Append the script tag to _before_ the closing head tag.
					tag.before(
            '<script defer> setTimeout(function() ' + 
            '{ $(\'link[href*="cookie-wall"]\').remove(); }, 5000)' +
            '</script>', {html: true});
			})
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
    
    if (pathname == '/test') {
        console.log('here');

    const myurl = 'https://www.repubblica.it/economia/2021/10/26/news/governo_sindacati_draghi_lascia_la_riunione-323878439/amp/';


    const resp = await fetch("https://www.repubblica.it/", {
  "headers": {
    "authority": 'www.repubblica.it',
     'pragma': 'no-cache',
     'sec-ch-ua': '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
     'sec-ch-ua-mobile': '?0',   
     'sec-ch-ua-platform': "Windows", 
     'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
     'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
     'sec-fetch-site': 'none',
     'sec-fetch-mode': 'navigate',
     'sec-fetch-user': '?1',
     'sec-fetch-dest': 'document',
     'accept-language': 'it-IT,it;q=0.9'
    
  },
  "body": null,
  "method": "GET"
});
    const body = await resp.text();

return new Response(body);

    }

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
    var ret = await fetch(pathname.replace("/https:/","https://"), 
        {
        "headers": {
            "authority": 'www.repubblica.it',
            "Referer": "https://m.google.com",
            'pragma': 'no-cache',
            'sec-ch-ua': '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',   
            'sec-ch-ua-platform': "Windows", 
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'none',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            'accept-language': 'it-IT,it;q=0.9'
            
        },
        "body": null,
        "method": "GET"
        });
    
    //respheaders);
    
    if (pathname.indexOf("repubblica.it/") == -1) {
      const rewriter = new HTMLRewriter()
      .on("*", new RemoveElement());
      return rewriter.transform(ret);
    } else {
      const rewriter = new HTMLRewriter()
      .on("body", new CookieDeleter())
      .on("div", new RepItElement());
      return rewriter.transform(ret);  
    }
  
  }
