var container = document.querySelector("#ritem");
var containerBig = document.getElementById("container");
var restaurantId = document.getElementById("restaurantId").innerText;
var url = "https://knight-foodji.herokuapp.com/api/restaurant/" + restaurantId;

fetch(url, {
  accept: "application/json",
  mode: "cors",
  method: "GET",
})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    var ar = [];
    ar = data;

    [...ar["restaurant"].foods].forEach((foodItem) => {
      var food = container.cloneNode(true);
      console.log(foodItem);
      //   food.childNodes[1]["attributes"]["href"]["value"] =
      //     "/" + element.name + "/" + element.id;

      // console.log(a);

      //   var img = food.childNodes[1].childNodes[1].childNodes[1].childNodes[1];
      //   img["attributes"][0]["value"] = element.image;

      var name =
        food.childNodes[1].childNodes[1].childNodes[3].childNodes[1]
          .childNodes[1];
      name["innerText"] = foodItem["foodid"].name;

      var price =
        food.childNodes[1].childNodes[1].childNodes[3].childNodes[1]
          .childNodes[3];
      price["innerText"] = foodItem.price;

      //   var address =
      //     food.childNodes[1].childNodes[1].childNodes[3].childNodes[3];
      //   address["innerText"] = element.address;

      container.after(food);
      // containerBig.removeChild(containerBig.firstChild);
    });
  })
  .then((_) => {
    containerBig.removeChild(containerBig.childNodes[1]);
  });
