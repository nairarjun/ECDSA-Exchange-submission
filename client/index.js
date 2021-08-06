import "./index.scss";

const server = "http://localhost:3042";
var amtBtn = document.getElementById("transfer-amount")
amtBtn.style.display = "none";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("sign-in").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const body = JSON.stringify({
    sender, amount
  });

  const request = new Request(`${server}/signin`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ signature }) => {
    sessionStorage.setItem("signature", JSON.stringify(signature))
    alert("Sign in successful")
  });
});

document.getElementById("verify").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const body = JSON.stringify({
    signature: JSON.parse(sessionStorage.getItem('signature')),
    sender, amount
  });

  const request = new Request(`${server}/verify`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ verify }) => {
    const status = verify ? 'Passed' : 'Failed'
    if(verify) amtBtn.style.display = "block";
    alert(`Verification ${status}`)
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;

  const body = JSON.stringify({
    sender, amount, recipient
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
