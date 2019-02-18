const Promise = require('promise');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

//variable :
var castles = [];
var castlesPagePromises = [];
var castlesInfoPromises = [];
var midle = 0;


//With this function we get the link of each restaurants in the url we are
function CastleFromUrl(url) {
    //console.log("debut");
    return new Promise(function (resolve, reject) {
        //console.log("dans promesse");
        request(url, function (err, res, html) {

            if (err) {
                console.error(err.message);
                return reject(err);
            }

            else if (res.statusCode !== 200) {
                //if status code is equal to 200, the request is successfull
                //here we can see what kind of error
                err = new Error("status code : " + res.statusCode);
                err.res = res;
                console.error(err.message);
                return reject(err);
            }

            //console.log("dedans");
            //now we use cheerio to gather data
            //we load the html in the var $
            var $ = cheerio.load(html);

            //When we inspect the html of relais&chateau at the link on top,
            //We can find that castle from france are grouped in the class
            //<h3>France</h3>
            //and there there is one <li> for each castle, we just have to take all 
            //of them and we have created the list of castle with the link to the castle, name and the chef name
            //
            //So we have to get it with cheerio, 
            //


            $('h3:contains("France")')
                .next()
                .find("li")
                .each(function () { //here is our loop
                    let data = $(this);
                    //get url
                    let url = String(data.find("a").attr("href"));

                    //get name of castle
                    let hotelname = data.find("a").first().text().trim();
                    hotelname = hotelname.replace(/\n/g, ""); //we delete \n char

                    //get  chef name
                    let chefname = String(data.find('a:contains("Chef")').text().split(" - ")[1]).trim();
                    //We split because in the html, chef name is preceed by "chef - " so we have took the snd argument
                    chefname = chefname.replace(/\n/g, "");

                    //then we had it in our castles list

                    castles.push({
                        url: url,
                        name: hotelname,
                        chefname: chefname,
                        postalCode: "",
                        price: ""
                    });
                });
            //console.log(castles);
            resolve(castles);
        });
    });
}

//We create one promise for castle, then add the url, castle name and chef name
function CastlesPromisesCreation() {
    let url = 'https://www.relaischateaux.com/fr/site-map/etablissements';
    castlesPagePromises.push(CastleFromUrl(url));
    //console.log("castles added");
}


//Fill in information for each castle
function FillInCastle(url, i) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.error(err.message);
                return reject(err);
            }

            else if (res.statusCode !== 200) {
                //if status code is equal to 200, the request is successfull
                //here we can see what kind of error
                err = new Error("status code : " + res.statusCode);
                err.res = res;
                console.error(err.message);
                return reject(err);
            }


            //now we use cheerio to gather data
            //we load the html in the var $
            const $ = cheerio.load(html);

            //When we inspect the html of each castle, we can find the information of
            //each castle in the differents classes

            //PostalCode
            $('span[itemprop="postalCode"]')
                .first()
                .each(function () {
                    let data = $(this);
                    let postalCode = data.text();
                    castles[i].postalCode = String(postalCode.split(",")[0]).trim();
                });

            //Price
            $(".ajaxPages")
                .find('[itemprop="priceRange"]')
                .first()
                .each(function () {
                    let data = $(this);
                    let priceCastle = String(data.attr("content"));
                    castles[i].price = priceCastle;
                });


            //console.log("chateaux "+i+" pc added");

            //Other Informations
            resolve(castles);
        });
    });
}


//Same function as CastlesPromisesCreation
//But this time we create one promise for each castle
//We will fill in all the information for each castle
function CastlesIndivPromisesCreation() {

    //We create one promise for each restaurant
    return new Promise(function (resolve, reject) {
        //console.log(restaurants.length);

        if (midle == 0) {
            for (var i = 0; i < Math.trunc(castles.length / 2); i++) {
                let castleLink = castles[i].url;
                castlesInfoPromises.push(FillInCastle(castleLink, i));
                //console.log("castle " + i + " updated")


            }
            resolve();
            midle++;
            //console.log("je suis ici et midle vaut "+midle);
        }
        else if (midle == 1) {
            //console.log("je suis la");
            for (var i = castles.length / 2; i < Math.trunc(castles.length); i++) {
                let castleLink = castles[i].url;
                castlesInfoPromises.push(FillInCastle(castleLink, i));
                //console.log("castle " + i + " updated")

            }
            resolve();
            midle++;
        }

    });
}


//Create a JSON
function CastlesToJSON() {
    return new Promise(function (resolve, reject) {
        try {
            var jsonR = JSON.stringify(castles);
            fs.writeFile(
                "../json/castles.json",
                jsonR,
                function doneWriting(err) {
                    if (err) { console.error(err.message); }
                }
            );
        }
        catch (error) {
            console.error(error);
        }
        resolve();
    });
}

CastlesPromisesCreation();

var p = castlesPagePromises[0];
p.then(CastlesIndivPromisesCreation)
    .then(() => {
        return Promise.all(castlesInfoPromises)
    })
    .then(CastlesIndivPromisesCreation)
    .then(() => {
        return Promise.all(castlesInfoPromises)
    })
    .then(CastlesToJSON)
    .then(() => {
        console.log("Castlejsoncreate")
    })




module.exports.getJSONCastle = function () {
    return JSON.parse(fs.readFileSync("../json/castles.json"));
}
// Promise.all(restaurantsPagesPromises)
// .then(RestaurantsIndivPromisesCreation)
// .then(()=>{console.log(restaurantsInfoPromises)})



