/**
 * CIP.js - a CIP client in JavaScript
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 * 
 * This code includes the Qwest library in order to handle AJAX
 * requests in a nice way. Qwest is released under an MIT license.
 */

/*
 qwest, ajax library with promises and XHR2 support

 Version     : 0.4.2
 Author      : Aurélien Delogu (dev@dreamysource.fr)
 Homepage    : https://github.com/pyrsmk/qwest
 License     : MIT
 */
var qwest=function(){var win=window,limit=null,requests=0,request_stack=[],getXHR=function(){return win.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP")},version2=getXHR().responseType==="",qwest=function(method,url,data,options,before){data=data||null,options=options||{};var typeSupported=!1,xhr=getXHR(),async=options.async===undefined?!0:!!options.async,cache=!!options.cache,type=options.type?options.type.toLowerCase():"json",user=options.user||"",password=options.password||"",headers={"X-Requested-With":"XMLHttpRequest"},accepts={xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"},vars="",i,parseError="parseError",serialized,success_stack=[],error_stack=[],complete_stack=[],response,success,error,func,promises={success:function(e){return async?success_stack.push(e):success&&e.apply(xhr,[response]),promises},error:function(e){return async?error_stack.push(e):error&&e.apply(xhr,[response]),promises},complete:function(e){return async?complete_stack.push(e):e.apply(xhr),promises}},promises_limit={success:function(e){return request_stack[request_stack.length-1].success.push(e),promises_limit},error:function(e){return request_stack[request_stack.length-1].error.push(e),promises_limit},complete:function(e){return request_stack[request_stack.length-1].complete.push(e),promises_limit}},handleResponse=function(){var i,req,p;--requests;if(request_stack.length){req=request_stack.shift(),p=qwest(req.method,req.url,req.data,req.options,req.before);for(i=0;func=req.success[i];++i)p.success(func);for(i=0;func=req.error[i];++i)p.error(func);for(i=0;func=req.complete[i];++i)p.complete(func)}try{if(xhr.status!=200)throw xhr.status+" ("+xhr.statusText+")";var responseText="responseText",responseXML="responseXML";if(type=="text"||type=="html")response=xhr[responseText];else if(typeSupported&&xhr.response!==undefined)response=xhr.response;else switch(type){case"json":try{win.JSON?response=win.JSON.parse(xhr[responseText]):response=eval("("+xhr[responseText]+")")}catch(e){throw"Error while parsing JSON body"}break;case"js":response=eval(xhr[responseText]);break;case"xml":if(!xhr[responseXML]||xhr[responseXML][parseError]&&xhr[responseXML][parseError].errorCode&&xhr[responseXML][parseError].reason)throw"Error while parsing XML body";response=xhr[responseXML];break;default:throw"Unsupported "+type+" type"}success=!0;if(async)for(i=0;func=success_stack[i];++i)func.apply(xhr,[response])}catch(e){error=!0,response="Request to '"+url+"' aborted: "+e;if(async)for(i=0;func=error_stack[i];++i)func.apply(xhr,[response])}if(async)for(i=0;func=complete_stack[i];++i)func.apply(xhr)};if(limit&&requests==limit)return request_stack.push({method:method,url:url,data:data,options:options,before:before,success:[],error:[],complete:[]}),promises_limit;++requests;if(win.ArrayBuffer&&(data instanceof ArrayBuffer||data instanceof Blob||data instanceof Document||data instanceof FormData))method=="GET"&&(data=null);else{var values=[],enc=encodeURIComponent;for(i in data)values.push(enc(i)+(data[i].pop?"[]":"")+"="+enc(data[i]));data=values.join("&"),serialized=!0}method=="GET"&&(vars+=data),cache||(vars&&(vars+="&"),vars+="t="+Date.now()),vars&&(url+=(/\?/.test(url)?"&":"?")+vars),xhr.open(method,url,async,user,password);if(type&&version2)try{xhr.responseType=type,typeSupported=xhr.responseType==type}catch(e){}version2?xhr.onload=handleResponse:xhr.onreadystatechange=function(){xhr.readyState==4&&handleResponse()},serialized&&method=="POST"&&(headers["Content-Type"]="application/x-www-form-urlencoded"),headers.Accept=accepts[type];for(i in headers)xhr.setRequestHeader(i,headers[i]);return before&&before.apply(xhr),xhr.send(method=="POST"?data:null),promises};return{get:function(e,t,n,r){return qwest("GET",e,t,n,r)},post:function(e,t,n,r){return qwest("POST",e,t,n,r)},xhr2:version2,limit:function(e){limit=e}}}();

/**
 * A general-purpose client library for CIP endpoints. Implements session
 * handling and requests.
 * @constructor
 * @param {string} endpoint : The URL to the CIP endpoint
 */
function CIPClient(endpoint) {
    this.CIP_BASE = endpoint;
    this.jsessionid = null;
    this.DEBUG = true;
    
    /** 
     * Makes a request to the CIP server.
     * 
     * @param {string} name : The name of the function (the path).
     * @param {object} options: POST-data options to pass.
     * @param {function} success: The callback function on success.
     * @param {function} error: The callback function on failure.
     */
    this.ciprequest = function(name, options, success, error) {
        var self = this; // TODO: Fix this hack
        
        var queryStringObject = { 
            apiversion: 4,
            serveraddress: "localhost"
        };
        
        if (options !== undefined) {
            for (var key in options) {
                queryStringObject[key] = options[key];
            }
        }

        if (this.jsessionid === null && name !== "session/open") {
            console.error("ERROR: No jsessionid");
        }
        
        var jsessionid_container = this.jsessionid===null?"":";jsessionid=" + this.jsessionid;
        

        return qwest.post(this.CIP_BASE + name + jsessionid_container, 
                          queryStringObject, 
                          {async:false},
                          function() {
                              // Set XMLHTTP properties here
                          })
            .success(success || function(response) {
                console.log(["default success", name, response]);
            })
            .error(error || function(response) {
                console.log(["default error", name, response]);
            });
    };
    
    /**
     * Opens a session to the CIP endpoint with the given username
     * and password.
     * 
     * @param {string} username : The username to log in with.
     * @param {string} password : The password to log in with.
     * @param {function} success: The callback function on success.
     * @param {function} error: The callback function on failure.
     */
    this.session_open = function(username, password, success, error) {
        var self = this; // TODO: fix this hack
        
        this.ciprequest("session/open", {user: username, password: password}, 
                        function(response) {
                            if (response.jsessionid) {
                                self.jsessionid = response.jsessionid;
                                console.log("Connected to CIP: "+self.jsessionid);
                                
                                success(response);
                            } else {
                                // fail
                                return;
                            }
                        },
                        function(response) {
                            error(response) || console.error("Could not make request to CIP.");
                        });

    };
    
    /**
     * Closes the currently open session.
     */
    this.session_close = function() {
        this.ciprequest("session/close", {});
        //qwest.post(this.CIP_BASE + "session/close", {jsessionid: this.jsessionid});
    };
}
