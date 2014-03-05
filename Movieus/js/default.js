// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    WinJS.Utilities.startLog();
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
                folderSelection().then(loadMovies);
                
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
    
})();
function loadMovies(folder) {
    var api = getApi();
    var grid = createMoviesGrid();
    changeLoadingState(10, "L'api a été chargé");
    readFiles(getMoviesFromApi(api, grid), folder)
}
function folderSelection() {
    var moviesExtensions = [".mp4", ".avi"];
    // Clean scenario output 
    WinJS.log && WinJS.log("", "sample", "status");

    // Create the picker object and set options 
    var folderPicker = new Windows.Storage.Pickers.FolderPicker;
    folderPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
    // Users expect to have a filtered view of their folders depending on the scenario. 
    // For example, when choosing a documents folder, restrict the filetypes to documents for your application. 
    folderPicker.fileTypeFilter.replaceAll(moviesExtensions);
    return folderPicker.pickSingleFolderAsync();
}



function readFiles(f, folder) {
    function getMovies(items) {
        for (var i = 0; i < items.length; i++) {
            console.log(i);
            if (items[i] instanceof Windows.Storage.StorageFile) {
                f(items[i]);
            }
            else if (items[i] instanceof Windows.Storage.StorageFolder) {
                items[i].getItemsAsync().done(getMoviesI);
            }
        }
    }
    
    if (folder) {
        // Application now has read/write access to all contents in the picked folder (including sub-folder contents) 
        // Cache folder so the contents can be accessed at a later time 
        Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.addOrReplace("PickedFolderToken", folder);

        folder.getFilesAsync().then(getMovies);
        
    } else {
        // The picker was dismissed with no selected file 
        WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
    }
}
function changeLoadingState(add, message) {
    document.getElementById("labelProgressBar").innerText = message;
    var bar = document.getElementById("determinateProgressBar");
    bar.value = bar.value + add;
}