const castle = require('./castle.js');
const michelin = require('./michelin.js');
var fs = require('fs');

var castles = castle.getJSONCastle();
var restaurants = michelin.getJSONMichelin();

//console.log(castles);
//console.log(restaurants);
var castleWithStarredRest = newList(restaurants,castles);
fs.writeFileSync("../json/newList.json",JSON.stringify(castleWithStarredRest))

function newList(restaurants,castles){
    var castleWithStarredRest = []
    console.log("dans la fonction")
    console.log("taille resto "+restaurants.length)
    console.log("taille chato "+castles.length)

    for(var i = 0; i < restaurants.length ; i++){
        //console.log("i vaut "+i)
        for(var j = 0 ; j < castles.length ; j++){
            //console.log("dans la boucle")
            

            //if the chef name and the postalCode are equals, so the castle
            //have a starred restaurant, we can add it to our newList
            if(restaurants[i].chef === castles[j].chefname
                && 
                restaurants[i].postalCode === castles[j].postalCode)
                {
                    console.log("im here");
                    castleWithStarredRest.push({
                        name:castles[j].name,
                        postalCode:castles[j].postalCode,
                        price:castles[j].price,
                        linkToCastle: castles[j].url
                    });
                }
        }
    }
    console.log("boucle finie")
    return castleWithStarredRest;
}



module.exports.castleWithStarredRest = castleWithStarredRest;
//console.log("test");