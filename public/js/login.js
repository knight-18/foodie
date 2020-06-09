var loginForm = document.getElementsByClassName("login-form")[0];
// var loginFirm = document.getElementById("login-form")[0];

loginForm.onsubmit = (e) => {
  e.preventDefault();
  var phone = document.getElementById("phone").value;
  var password = document.getElementById("password").value;
  //   e.preventDefault();
  // ../../api/user/login
  var body = JSON.stringify({
    phone: phone,
    password: password,
  });
  console.log(phone, password);
  console.log(body);
  fetch("../../api/user/login", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: body,
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("foodji-user-auth-header", "Bearer " + data.token);
      localStorage.setItem("foodji-user-name", data.user.name);
      window.location = "../../ui/user/user_profile";
    })
    .catch((err) => console.log(err));
  //   //   console.log(phone, password);
};
