var nm = new Natmus();

nm.session_open(BB_USERNAME, BB_PASSWORD, function(nms) {
    nms.get_layout("bitblueprint", function(response) {
        console.log(response);
    });
    

    //nm.session_close();
});

