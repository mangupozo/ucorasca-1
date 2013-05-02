/*
 * Communications.js
 *
 * Module which contains functions to scratch
 *
 * Version: 0.1a @ May 2013
 */
 
var Communications = {}
 
Communications = (function(window, document){
                //var reqUri = "http://uco-backend.herokuapp.com/games/puzzle/new";
                var reqUri = "https://dl.dropboxusercontent.com/u/13253709/prueba.json";
                function init( initGame ){
                        var jsonFile ;
                        xhrGet(reqUri, function(data) {
 
                                jsonFile = JSON.parse(this.responseText);
                                
                                //alert("DIF: "+jsonFile.puzzle.difficult);

                                // Init the scratch motion
                                initGame(jsonFile);
 
                        });
                       
 
                }
 
                function xhrGet(reqUri,callback) {
                        var xhr = new XMLHttpRequest();
 
                        xhr.open("GET", reqUri, true);
                        xhr.onload = callback;
 
                        xhr.send();
                }
 
               
               return {
                        init: init                        
               }
 
}(window, document));