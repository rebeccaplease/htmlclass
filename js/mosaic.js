var canvas = document.createElement('canvas'); // In memory canvas
var ctx    = canvas.getContext("2d");

var largeImage = new Image();
var size = 20; //px

//hold image objects
var parts = []; //store split images (base64 url)
function ImageObject(dataUrl, i, j, link, img) {
  this.url = dataUrl;
  this.x = i;
  this.y = j;
  this.link = link;
  this.img = img;
  this.hasColor = false;
  // this.r
  // this.g
  // this.b
}
//loading overlay
function loading() {
       // add the overlay with loading image to the page
      //  var over = '<div id="overlay">' +
      //      '<img id="loading" src="http://bit.ly/pMtW1K">' +
      //      '</div>';
       var over = $('<div>',{
         id: 'overlay',
         html: 'loading...'
       });
       var img = $('<img>',{
         id: 'loading',
         src: 'http://bit.ly/pMtW1K'
       });
       $(img).appendTo(over);
       $(over).appendTo('body');
   };

var file,reader;
//upload file
function previewFile() {
  file = $('#fileinput')[0].files[0];
  reader = new FileReader();
  //show preview of uploaded image
  reader.onloadend = function () {
    $('#preview').prop('src',reader.result);
    largeImage.src = reader.result;
    //colorSearch();
  }

  if (file) {
    reader.readAsDataURL(file);
  } else {
    $('#preview').prop('src', '');
  }
  largeImage.onload = split_N;

}

//split uploaded image into size squares
var def = [];
function split_N(){
  loading();
  $('#create').html('Analyzing colors...');
  var Nx = Math.floor(largeImage.width / size),
      Ny = Math.floor(largeImage.height / size);
  var offsetX = largeImage.width % size;
  var offsetY = largeImage.height % size; //calculate offset for image
  canvas.width  = size;
  canvas.height = size;
  console.log('width: ', largeImage.width, 'height: ', largeImage.height);
  console.log('offset x: ', offsetX, 'offset y: ', offsetY);
  console.log('Num x: ', Nx, 'Num y: ', Ny);
  var count = 0;
  for(var j=0; j<Ny; j++){
    /*var div = $('<div>',{
      id: 'rowImg'+j,
      class: 'row'
    });
    div.appendTo($('#pieces'));*/
      for(var i=0; i<Nx; i++){
        var x = -size*i - offsetX/2.0;
        var y = -size*j - offsetY/2.0;
        ctx.drawImage(this, x, y, size*Nx+offsetX, size*Ny+offsetY); // img, x, y, w, h

        var url = canvas.toDataURL();

        //temp.push(url);
        var img = new Image();

        parts.push(new ImageObject(url, i, j, '', null));
        img.onload = function(){
          count++;
          def.push(colorSearch(this));
          //called on the last image of last completed instagram search
          if(count >= Nx*Ny){
            $.when.apply(null, def).done(function() {
              //enable button
              $('#create').html('Generate mosaic!');
              $('#create').prop('disabled', false);
              $('#overlay').remove();
            });
          }

        };

        img.src = url;
        /*
        var piece = $('<img />',{
          src: url,
          id: 'test'+i+j,
          alt: 'split images'
        });
        piece.appendTo('#rowImg'+j);*/
    }
    //parts.push( temp );     // ("image/jpeg") for jpeg
    //console.log( temp.length );
    //$('#pieces').append('<br>');
  }
  //enable generate button

}
//assigns color to uploaded image using color-thief.js
function colorSearch(img) {
  var colorThief = new ColorThief();
  var color = colorThief.getColor(img);
  //console.log(this.src);
  //find array position of image and append color to
  //var assigned = false;
  //while(!assigned){
    for(var i = 0; i < parts.length; i++){
      if(parts[i].url == img.src && !parts[i].hasColor){
        parts[i].hasColor = true;
        parts[i].r = color[0];
        parts[i].g = color[1];
        parts[i].b = color[2];

        //console.log(i);
        //assigned = true;
        break;
      }
    //}
  }
  return color;
}
//store instagram images and color
var insta = [];

//compare image colors
function compare(alpha,beta) {
  // var aDist = sqrt(alpha.r*alpha.r + alpha.g*alpha.g + alpha.b*alpha.b);
  // var bDist = sqrt(beta.r*beta.r + beta.g*beta.g + beta.b*beta.b);
  var distance = Math.sqrt(Math.pow(alpha.r-beta.r,2) + Math.pow(alpha.g-beta.g,2) + Math.pow(alpha.b-beta.b,2))
  return distance;
}

//enter two imageobjects, return color difference
$('document').ready(function(){
  $('#create').click(function(){
    //var searchTerm = 'nyc';
    //for loop to search through entered terms
    //max 5
    //default term is nyc
    //33 limit

    var numTerms = 2;
    //get searchTerms from a box or something
    var searchTerms = ['fish','cats','dogs'];
    getInstagramResults(searchTerms);
    $(this).prop('disabled',true);
    $(this).html('loading...');

  });
    //clicking on image opens instagram link in new page

    $('#mosaic').on('click', '.mo', function(){
      //open instagram link
      //console.log('clicked', $(this).prop('alt'));
      window.open($(this).prop('alt'),'_blank');
      //or clear everything and perform division and search again
    });
  });

function colorSearchInsta(img) {
  var colorThief = new ColorThief();
  var color = colorThief.getColor(img);
    //append to array of imageobjects
    //search through entire downloaded array of images
  for(var i = 0; i < insta.length; i++){
  //for(var i = insta.length; i >= 0; i--){
      if(insta[i].url == img.src){
        insta[i].r = color[0];
        insta[i].g = color[1];
        insta[i].b = color[2];
        //console.log(i);
        break;
      }
    }
    return color;
  }
  function compareIndex(a,b){
    if (a.y == b.y) {
      return a.x - b.x;
    }
    return a.y - b.y;
  }

//called for each instagram search
//boolColor true when last instagram search is completed
var deferreds = [];
var mosaic = [];
function fillInstaCallback(response, boolColor){
    var count = 0;
    for(var i = 0; i<response.length; i++) {
      var img = new Image();
      img.crossOrigin = "Anonymous";


      //call colorSearchInsta on array of all downloaded images
      //returns array of deferred objects

      img.onload = function(){
          count++;
          //var c =colorSearchInsta(this);
          deferreds.push(colorSearchInsta(this));

          //called on the last image of last completed instagram search
          if(boolColor && (count==response.length-1)){

            $.when.apply(null, deferreds).done(function() {
              console.log('color searches complete! :D');
              //assign and compare images'
              //call colorsearchinsta now all images have been downloaded
              //for each element in the image array, compare to the instagram array
              for(var k = 0; k < parts.length; k++){
                //insta index of best match
                var min = -1;
                //value of best match
                var last = 100000;
                for(var j = 0; j < insta.length; j++){
                  //find closest distance to current image k
                  //if no color assigned, take from previous k
                  if(!parts[k].hasColor){
                    parts[k].r = parts[k-1].r;
                    parts[k].g = parts[k-1].g;
                    parts[k].b = parts[k-1].b;
                    parts[k].hasColor = true;
                  }
                  var dist = compare(parts[k],insta[j]);
                  if(dist < last){
                    //save value
                    last = dist;
                    //save index
                    min = j;
                  }
                }
                //console.log(k,min,last);
                //console.log(insta[min]);
                mosaic.push(new ImageObject(insta[min].url, parts[k].x, parts[k].y, insta[min].link, ''))
              }
              //sort mosaic array by index
              //console.log(mosaic);
              mosaic.sort(compareIndex);
              //console.log(mosaic);

              //display onto page

              var Nx = Math.floor(largeImage.width / size);
              for(var n = 0; n < mosaic.length; n++){
                //$('#mosaic').append('<img src=\"'+mosaic[n].url+'\" id=\"yay'+mosaic[n].x+''+mosaic[n].y+'\" alt=\"mosaic images\"/>');
                //create new row div for new line
                if(mosaic[n].x == 0){
                  var div = $('<div>',{
                    id: 'rowMosaic'+mosaic[n].y,
                    class: 'row'
                  });
                  div.appendTo($('#mosaic'));
                }
                var mo = $('<img />',{
                    id: 'mo'+mosaic[n].x+''+mosaic[n].y,
                    class: 'mo',
                    src: mosaic[n].url,
                    alt: mosaic[n].link
                  });
                mo.appendTo('#rowMosaic'+mosaic[n].y);


                //click on brings to instagram url
              }

            });
          }
          //return c;
        }
      var url = response[i].images.thumbnail.url;
      img.src = url;

      insta.push(new ImageObject(url, -1, -1, response[i].link, img));

      //console.log(url);
    }
  }
function getInstagramResults(searchTerms) {
  var count = 0;
  for (var i = 0; i < searchTerms.length; i++) {
    $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/search/tag/"+searchTerms[i]+"?count=100", function(response){
      //console.log(count, numTerms);
      fillInstaCallback(response, count++ == searchTerms.length-1);
    });
  }
}
