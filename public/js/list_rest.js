var container = document.getElementById("container");

fetch("https://knight-foodji.herokuapp.com/api/restaurant", {
  accept: "application/json",
  mode: "cors",
  method: "GET",
})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    data.forEach((element) => {
      console.log(element);
      var colmd4colsm6 = document.createElement("div");
      colmd4colsm6.className = "col-md-4 col-sm-6";
      var singlefood = document.createElement("div");
      singlefood.className = "single-food";
      var foodiimg = document.createElement("div");
      foodiimg.className = "food-img";
      var img = document.createElement("img");
      img.className = "img-fluid";
      var foodcontent = document.createElement("div");
      foodcontent.className = "food-content";
      var dflex = document.createElement("div");
      dflex.className = "d-flex justify-content-between";
      var span = document.createElement("span");
      span.className = "style-change";
      var p = document.createElement("p");
      p.className = "pt-3";
      var h5 = document.createElement("h5");
      var a = document.createElement("a")

      container.appendChild(colmd4colsm6);
      colmd4colsm6.appendChild(singlefood);
      singlefood.appendChild(foodiimg);
      foodiimg.appendChild(img);
      img.src = element.image;

      singlefood.appendChild(foodcontent);
      foodcontent.appendChild(dflex);
      dflex.appendChild(h5);
      // h5.innerHTML = element.name;
      h5.appendChild(a)
      a.setAttribute("href",`../../ui/restaurant/restfood/${element.id}`)
      a.innerHTML= element.name
      dflex.appendChild(span);
      foodcontent.appendChild(p);
      p.innerHTML = element.address;
      console.log("Added");
    });
  });
