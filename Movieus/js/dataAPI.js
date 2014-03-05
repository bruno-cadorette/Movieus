function urlBuilder(api, file) {
    var title = encodeURIComponent(file.displayName);
    return api.url + api.title + title;
}
function getApi() {
    var apis = [{ url: "http://mymovieapi.com/?", title: "title=", timeout: 50 }, { url: "http://www.omdbapi.com/?", title: "t=", timeout: 100, isValid: "Response" }];
    var index = 0;
    //while (!isDown(apis[index].url)) {
    //    index++;
    //}
    return apis[1];
}
function getMoviesFromApi(api, grid) {
    return function (file) {
        setTimeout(function () {
            $.get(urlBuilder(api, file), function (x) {
                var movie = JSON.parse(x);
                if (movie[api.isValid] === "False") {
                    console.log(file.displayName);
                    
                }
                else {
                    grid.addRow(movie);
                    changeLoadingState(1, "Le film " + movie.Title + " a été chargé");
                }
            });
        }, api.timeout);
    }
}

function isDown(url) {
    try {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status != 404;
    }
    catch (ex) {
        return false;
    }

}