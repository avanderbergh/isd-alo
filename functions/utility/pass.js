const functions = require('firebase-functions');
const endPointUrl = 'https://3sys.isdedu.de/Wcbs.API.2.2/api/';
var fetch = require("fetch-retry");
require('url-search-params-polyfill');


module.exports =  {
    wcbs22_get_token: function(){
        queryUrl = endPointUrl+'token';
        const params = new URLSearchParams();
                //var params = new URLSearchParams();
        params.append('grant_type','client_credentials');
        params.append('client_id',functions.config().wcbs22.id);
        params.append('client_secret',functions.config().wcbs22.secret);

        queryParams={
            headers:{'User-Agent':'isd-sync-services'},
            body:params,
            method:"POST"
            };

        return this.queryAPI(queryUrl,queryParams,"token");

    },

    wcbs22_prepare_query: function(params){
        
        var queryParts = [];
            if (params.expand) queryParts.push("$expand="+params.expand);
            if (params.filter) queryParts.push("$filter="+params.filter);
            if (params.select) queryParts.push("$select="+params.select);
            if (params.top) queryParts.push("$top="+params.top);
        var query = queryParts.join('&');
    
        return endPointUrl+'schools(1)/'+params.endpoint+'?'+query;
  },
  /* ***********************************
Function to query an API
util.queryAPI(endPointUrl+'token',otherParams,"token");
************************************/
    queryAPI: function(url,params,desc){ 
        

    return new Promise((resolve) => fetch(url,params,{
      retries: 3,
      retryDelay: 1000
    })
    // eslint-disable-next-line consistent-return
    .then((res) => {
      console.log(desc+": HEADERS "+ res.headers.get("content-type")); 
      // eslint-disable-next-line promise/always-return
      if (res.headers.get("content-type") !== null){
          if (res.headers.get("content-type").includes("application/json")){
            output = res.json();
          }
          else if (res.headers.get("content-type") === "image/jpeg") {
            output = res.buffer(); // binary data in full
          }
      else {
        console.log (res);
      }
      //console.log(output);
      return output;
    }})
    .then((result) => resolve(result)));
  }
}
