var nm = new CIPClient("http://samlinger.natmus.dk/CIP/");

nm.session_open(BB_USERNAME, BB_PASSWORD, function() {
    // nm.get_layout("bitblueprint", function(response) {
    //     console.log(response);
    // });
    nm.ciprequest("metadata/getlayout/"+"bitblueprint", {}, function(response) {
        console.log(response);
    });
    
});
