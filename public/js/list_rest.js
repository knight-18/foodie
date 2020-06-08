var container = document.querySelector("#ritem");
var containerBig = document.getElementById("container");
fetch("https://knight-foodji.herokuapp.com/api/restaurant?pageNo=1&size=10", {
  accept: "application/json",
  mode: "cors",
  method: "GET",
})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    data.forEach((element) => {
      var restaurant = container.cloneNode(true);

      restaurant.childNodes[1]["attributes"]["href"]["value"] = `../../ui/restaurant/${element.name}/${element.id}`
        // "restaurant/" + element.name + "/" + element.id;

      // console.log(a);

      var img =
        restaurant.childNodes[1].childNodes[1].childNodes[1].childNodes[1];
      img["attributes"][0]["value"] = element.image;

      var name =
        restaurant.childNodes[1].childNodes[1].childNodes[3].childNodes[1]
          .childNodes[1];
      name["innerText"] = element.name;

      var address =
        restaurant.childNodes[1].childNodes[1].childNodes[3].childNodes[3];
      address["innerText"] = element.address;

      container.after(restaurant);
      // containerBig.removeChild(containerBig.firstChild);
    });
  })
  .then((_) => {
    containerBig.removeChild(containerBig.childNodes[1]);
  });
