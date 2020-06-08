console.log("connected")
var registerForm = document.getElementsByClassName("register-form")[0];

registerForm.onsubmit = (e) => {
  e.preventDefault();
  var name = document.getElementById('name').value 
  var phone = document.getElementById("phone").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var address = document.getElementById("address").value;
  console.log(name, phone,email,password,address)
  //   e.preventDefault();
  // ../../api/user/login
  var body = JSON.stringify({
    name: name,
    phone: phone,
    email:email,
    password: password,
    address: address
  });
  console.log(phone, password);
  console.log(body);
  fetch("../../api/user/", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: body,
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("foodji-user-auth-header", "Bearer " + data.token);
      localStorage.setItem("foodji-user-name", data.user.name);
      window.location = "../../ui/restaurant/1";
    })
    .catch((err) => console.log(err));
  //   //   console.log(phone, password);
};
