const Promise = require('promise');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

//variable :
var restaurants = [];
var restaurantsPagesPromises = [];
var restaurantsInfoPromises = [];


//With this function we get the link of each restaurants in the url we are
function restaurantFromUrl(url) {
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

            //When we inspect the html of michelin, we can find the link to each restaurant in the class ".poi-card-link"
            //So we have to get it with cheerio, then add the url in the restaurant list

            //for each link of the page
            $(".poi-card-link").each(function () {
                let data = $(this);
                let link = data.attr("href");
                let urlRestaurant = "https://restaurant.michelin.fr" + link;

                //then we create a new restaurant and add the link.
                restaurants.push({
                    url: urlRestaurant,
                    name: "",
                    chef: "",
                    stars: "",
                    price: "",
                    postalCode: ""
                });
            });
            //console.log(restaurants)
            resolve(restaurants);
        });
    });
}

//We create one promise for each page of starred restaurants
//For each page of starred restaurants, add the url of each restaurant
function RestaurantsPagesPromisesCreation() {
    for (var i = 0; i < 37; i++) {
        let url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + i.toString;
        restaurantsPagesPromises.push(restaurantFromUrl(url));
        console.log("page " + i + " added");
    }
    //console.log(restaurantsPagesPromises.length)
}


//Fill in information for each Restaurant
function FillInRestaurant(url, i) {
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

            //When we inspect the html of each restaurant, we can find the information of
            //each restaurant in the differents classes

            //Name
            $(".poi_intro-display-title")
                .first()
                .each(function () {
                    let data = $(this);
                    let name = data.text();
                    //We need to take out all the newlines because this would cause some problems for the json
                    name = name.replace(/\n/g, "");
                    restaurants[i].name = name.trim();
                });

            $(".postal-code")
                .first()
                .each(function () {
                    let data = $(this);
                    let pc = data.text();
                    restaurants[i].postalCode = pc;
                });

            $(
                "#node_poi-menu-wrapper > div.node_poi-chef > div.node_poi_description > div.field.field--name-field-chef.field--type-text.field--label-above > div.field__items > div"
            )
                .first()
                .each(function () {
                    let data = $(this);
                    let chefname = data.text();
                    restaurants[i].chef = chefname;
                });

            $('span[itemprop="priceRange"]')
                .first()
                .each(function () {
                    let data = $(this);
                    let priceOk = data.text();
                    restaurants[i].price = String(
                        priceOk.split("-")[1]
                    ).trim();
                });

            //console.log("restaurant " + i + " name updated");
            //Other Informations
            resolve(restaurants);
        });
    });
}


//Same function as RestaurantsPromisesCreation
//But this time we create one promise for each restaurants
//We will fill in all the information for each Restaurants
function RestaurantsIndivPromisesCreation() {

    //We create one promise for each restaurant
    return new Promise(function (resolve, reject) {
        //console.log(restaurants.length);
        for (var i = 0; i < restaurants.length; i++) {
            let restLink = restaurants[i].url;
            restaurantsInfoPromises.push(FillInRestaurant(restLink, i));
            //console.log("restaurant " + i + " updated")
            resolve();
        }
        //console.log("fin");
    });
}


//Create a JSON
function RestaurantsToJSON() {
    return new Promise(function (resolve, reject) {
        try {
            var jsonR = JSON.stringify(restaurants);
            fs.writeFile(
                "../json/restaurants.json",
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

RestaurantsPagesPromisesCreation();

Promise.all(restaurantsPagesPromises)
    .then(RestaurantsIndivPromisesCreation)
    .then(() => {
        //console.log("first")

        return Promise.all(restaurantsInfoPromises);
    })
    .then(RestaurantsToJSON)
    .then(() => {
        console.log("restaurantsjson created");
    })


module.exports.getJSONMichelin = function () {
    return JSON.parse(fs.readFileSync("../json/restaurants.json"));
}
// Promise.all(restaurantsPagesPromises)
// .then(RestaurantsIndivPromisesCreation)
// .then(()=>{console.log(restaurantsInfoPromises)})



